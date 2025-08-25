import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface Certificate {
  id: string;
  certificateNumber: string;
  studentName: string;
  program: string;
  graduationYear: number;
  status: string;
  issuedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CertificateVerificationResult {
  found: boolean;
  certificate?: Certificate;
  error?: string;
}

/**
 * Verify a certificate by its certificate number
 * @param certificateNumber - The certificate number to verify
 * @returns Promise<CertificateVerificationResult>
 */
export async function verifyCertificate(certificateNumber: string): Promise<CertificateVerificationResult> {
  try {
    // Validate input
    if (!certificateNumber || certificateNumber.trim().length === 0) {
      return {
        found: false,
        error: 'Certificate number is required'
      };
    }

    // Clean the certificate number (remove spaces, convert to uppercase)
    const cleanCertNumber = certificateNumber.trim().toUpperCase();

    // Search for the certificate in the database
    const certificate = await prisma.certificate.findUnique({
      where: {
        certificateNumber: cleanCertNumber
      }
    });

    if (!certificate) {
      return {
        found: false,
        error: 'Certificate number not found. Please check and try again.'
      };
    }

    // Check if certificate is valid (not revoked or expired)
    if (certificate.status !== 'valid') {
      return {
        found: true,
        certificate,
        error: `Certificate status: ${certificate.status}`
      };
    }

    return {
      found: true,
      certificate
    };

  } catch (error) {
    console.error('Error verifying certificate:', error);
    return {
      found: false,
      error: 'An error occurred while verifying the certificate. Please try again.'
    };
  }
}

/**
 * Create a new certificate (for admin use)
 * @param certificateData - Certificate data to create
 * @returns Promise<Certificate>
 */
export async function createCertificate(certificateData: {
  certificateNumber: string;
  studentName: string;
  program: string;
  graduationYear: number;
}): Promise<Certificate> {
  try {
    const certificate = await prisma.certificate.create({
      data: {
        certificateNumber: certificateData.certificateNumber.trim().toUpperCase(),
        studentName: certificateData.studentName.trim(),
        program: certificateData.program.trim(),
        graduationYear: certificateData.graduationYear,
        status: 'valid'
      }
    });

    return certificate;
  } catch (error) {
    console.error('Error creating certificate:', error);
    throw new Error('Failed to create certificate');
  }
}

/**
 * Get all certificates (for admin use)
 * @returns Promise<Certificate[]>
 */
export async function getAllCertificates(): Promise<Certificate[]> {
  try {
    const certificates = await prisma.certificate.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return certificates;
  } catch (error) {
    console.error('Error fetching certificates:', error);
    throw new Error('Failed to fetch certificates');
  }
}

/**
 * Update certificate status (for admin use)
 * @param certificateId - Certificate ID to update
 * @param status - New status (valid, revoked, expired)
 * @returns Promise<Certificate>
 */
export async function updateCertificateStatus(certificateId: string, status: string): Promise<Certificate> {
  try {
    const certificate = await prisma.certificate.update({
      where: {
        id: certificateId
      },
      data: {
        status
      }
    });

    return certificate;
  } catch (error) {
    console.error('Error updating certificate status:', error);
    throw new Error('Failed to update certificate status');
  }
}
