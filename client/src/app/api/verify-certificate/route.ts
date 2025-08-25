import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { FirebaseCertificate } from '@/services/firebaseCertificateService';

export async function POST(request: NextRequest) {
  try {
    const { certificateNumber } = await request.json();

    // Validate input
    if (!certificateNumber) {
      return NextResponse.json(
        { error: 'Certificate number is required' },
        { status: 400 }
      );
    }

    // Clean the certificate number
    const cleanCertNumber = certificateNumber.trim();

    // Get certificate from Firestore
    const docRef = doc(db, 'certificates', cleanCertNumber);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({
        success: false,
        error: 'Certificate not found. Please check your certificate number and try again.'
      });
    }

    const certificateData = docSnap.data() as FirebaseCertificate;

    // Check if certificate is valid
    if (certificateData.status !== 'Valid') {
      return NextResponse.json({
        success: false,
        error: `Certificate status: ${certificateData.status}`
      });
    }

    // Format the date
    const formatDate = (timestamp: any) => {
      if (!timestamp) return new Date().toISOString();
      try {
        if (timestamp.toDate && typeof timestamp.toDate === 'function') {
          return timestamp.toDate().toISOString();
        }
        if (timestamp.seconds) {
          return new Date(timestamp.seconds * 1000).toISOString();
        }
        return new Date(timestamp).toISOString();
      } catch (error) {
        return new Date().toISOString();
      }
    };

    return NextResponse.json({
      success: true,
      certificate: {
        certificateNumber: certificateData.certificateNumber,
        studentName: certificateData.fullName,
        program: certificateData.program,
        graduationYear: certificateData.yearOfCompletion,
        status: certificateData.status.toLowerCase(),
        issuedDate: formatDate(certificateData.createdAt),
        studentImageUrl: certificateData.studentImageUrl || null
      }
    });

  } catch (error) {
    console.error('Certificate verification API error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
