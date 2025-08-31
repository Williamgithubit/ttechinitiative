import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Switch,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  Button,
  Alert,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Lock as LockIcon,
  Notifications as NotificationsIcon,
  DeviceHub as DeviceIcon,
  Shield as ShieldIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useAppSelector } from "@/store/store";
import { SettingsService } from "@/services/settingsService";

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  passwordExpiry: number;
  loginNotifications: boolean;
  deviceTracking: boolean;
  ipWhitelist: string;
  lastPasswordChange: string;
  activeSessions: number;
  trustedDevices: number;
}

interface SecurityTabProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const SecurityTab: React.FC<SecurityTabProps> = ({ onSuccess, onError }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  useMediaQuery(theme.breakpoints.down("md"));
  // Security settings state
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginNotifications: true,
    deviceTracking: true,
    ipWhitelist: "",
    lastPasswordChange: "30 days ago",
    activeSessions: 2,
    trustedDevices: 3,
  });

  const [loading, setLoading] = useState(false);
  const currentUser = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    // Load security settings from localStorage
    let mounted = true;
    const load = async () => {
      try {
        const savedSecurity = localStorage.getItem("securitySettings");
        if (savedSecurity) {
          const parsed = JSON.parse(savedSecurity);
          if (mounted) setSecuritySettings((prev) => ({ ...prev, ...parsed }));
        } else if (currentUser && currentUser.uid) {
          const svcSettings = await SettingsService.getSecuritySettings(
            currentUser.uid
          );
          if (svcSettings && mounted) {
            // Map fields from service to local shape
            setSecuritySettings((prev) => ({
              ...prev,
              twoFactorEnabled: svcSettings.twoFactorEnabled,
              sessionTimeout: svcSettings.sessionTimeout,
              passwordExpiry: prev.passwordExpiry,
              loginNotifications:
                svcSettings.loginAlerts?.emailOnNewDevice ??
                prev.loginNotifications,
              deviceTracking: (svcSettings.allowedDevices?.length ?? 0) > 0,
              ipWhitelist: (svcSettings.trustedIPs || []).join("\n"),
              lastPasswordChange:
                svcSettings.lastPasswordChange || prev.lastPasswordChange,
            }));
          }
        }
      } catch {
        console.error("Error loading security settings");
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [currentUser]);

  const saveSettings = async (newSettings: SecuritySettings) => {
    try {
      setLoading(true);
      // Save to localStorage immediately
      localStorage.setItem("securitySettings", JSON.stringify(newSettings));

      // Save to backend if user is authenticated
      if (currentUser && currentUser.uid) {
        await SettingsService.updateSecuritySettings(currentUser.uid, {
          twoFactorEnabled: newSettings.twoFactorEnabled,
          loginAlerts: {
            emailOnNewDevice: newSettings.loginNotifications,
            emailOnSuspiciousActivity: newSettings.loginNotifications,
            showLastLoginInfo: true,
          },
          sessionTimeout: newSettings.sessionTimeout,
          allowedDevices: newSettings.deviceTracking ? ["*"] : [],
          lastPasswordChange: newSettings.lastPasswordChange,
          trustedIPs: newSettings.ipWhitelist
            ? newSettings.ipWhitelist
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
        });
      }

      setSecuritySettings(newSettings);
      onSuccess("Security settings updated successfully!");
    } catch (err) {
      onError("Failed to update security settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityChange = <K extends keyof SecuritySettings>(
    setting: K
  ) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let value: SecuritySettings[K];
    
    if (event.target.type === 'checkbox') {
      value = (event.target as HTMLInputElement).checked as SecuritySettings[K];
    } else if (event.target.type === 'number') {
      value = Number((event.target as HTMLInputElement).value) as SecuritySettings[K];
    } else {
      value = event.target.value as SecuritySettings[K];
    }
    
    const newSettings = { ...securitySettings, [setting]: value };

      // Auto-save for switches, manual save for text inputs
      if (event.target.type === "checkbox") {
        saveSettings(newSettings);
      } else {
        setSecuritySettings(newSettings);
      }
    };

  const handleTextFieldSave = (field: keyof SecuritySettings) => {
    // Only save if the field value is valid
    if (field in securitySettings) {
      const value = securitySettings[field];
      // Ensure the value is a valid type before saving
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        saveSettings(securitySettings);
      }
    }
  };

  const getSecurityScore = (): number => {
    let score = 0;
    if (securitySettings.twoFactorEnabled) score += 25;
    if (securitySettings.loginNotifications) score += 15;
    if (securitySettings.deviceTracking) score += 15;
    if (securitySettings.sessionTimeout <= 60) score += 20;
    if (securitySettings.passwordExpiry <= 90) score += 15;
    if (securitySettings.ipWhitelist.length > 0) score += 10;
    return score;
  };

  const getSecurityLevel = (score: number): { level: string; color: 'success' | 'primary' | 'warning' | 'error' } => {
    if (score >= 80) return { level: "Excellent", color: "success" as const };
    if (score >= 60) return { level: "Good", color: "primary" as const };
    if (score >= 40) return { level: "Fair", color: "warning" as const };
    return { level: "Poor", color: "error" as const };
  };

  const securityScore = getSecurityScore();
  const securityLevel = getSecurityLevel(securityScore);

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
      {/* Security Overview */}
      <Box sx={{ flex: "1 1 100%" }}>
        <Card>
          <CardHeader
            title="Security Overview"
            titleTypographyProps={{
              sx: {
                fontSize: { xs: "1.1rem", sm: "1.25rem" },
              },
            }}
          />
          <CardContent>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 3,
                alignItems: "center",
              }}
            >
              <Box
                sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)" } }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <ShieldIcon
                    color={securityLevel.color}
                    sx={{ fontSize: { xs: "2rem", sm: "2.5rem" } }}
                  />
                  <Box>
                    <Typography variant="h6">
                      Security Level: {securityLevel.level}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Security Score: {securityScore}/100
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box
                sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)" } }}
              >
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  <Box
                    sx={{ flex: "1 1 calc(33.33% - 8px)", textAlign: "center" }}
                  >
                    <Typography variant="h6">
                      {securitySettings.activeSessions}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Active Sessions
                    </Typography>
                  </Box>
                  <Box
                    sx={{ flex: "1 1 calc(33.33% - 8px)", textAlign: "center" }}
                  >
                    <Typography variant="h6">
                      {securitySettings.trustedDevices}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Trusted Devices
                    </Typography>
                  </Box>
                  <Box
                    sx={{ flex: "1 1 calc(33.33% - 8px)", textAlign: "center" }}
                  >
                    <Typography variant="h6">
                      {securitySettings.lastPasswordChange}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Last Password Change
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Authentication Settings */}
      <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 12px)" } }}>
        <Card>
          <CardHeader
            title="Security Settings"
            titleTypographyProps={{
              sx: {
                fontSize: { xs: "1.1rem", sm: "1.25rem" },
              },
            }}
          />
          <CardContent>
            <List>
              <ListItem>
                <ListItemIcon>
                  <LockIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Two-Factor Authentication"
                  secondary="Add an extra layer of security to your account"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={securitySettings.twoFactorEnabled}
                    onChange={handleSecurityChange("twoFactorEnabled")}
                    disabled={loading}
                  />
                </ListItemSecondaryAction>
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Login Notifications"
                  secondary="Get notified of new sign-ins to your account"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={securitySettings.loginNotifications}
                    onChange={handleSecurityChange("loginNotifications")}
                    disabled={loading}
                  />
                </ListItemSecondaryAction>
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <DeviceIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Device Tracking"
                  secondary="Track and monitor devices that access your account"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={securitySettings.deviceTracking}
                    onChange={handleSecurityChange("deviceTracking")}
                    disabled={loading}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>

            {!securitySettings.twoFactorEnabled && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Recommended:</strong> Enable Two-Factor Authentication
                  for better security.
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Session Management */}
      <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 12px)" } }}>
        <Card>
          <CardHeader title="Session Management" />
          <CardContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box>
                <TextField
                  fullWidth
                  label="Session Timeout (minutes)"
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={handleSecurityChange("sessionTimeout")}
                  onBlur={() => handleTextFieldSave("sessionTimeout")}
                  size={isMobile ? "small" : "medium"}
                  InputProps={{ inputProps: { min: 5, max: 240 } }}
                  helperText="How long until inactive sessions are logged out"
                />
              </Box>

              <Box>
                <TextField
                  fullWidth
                  label="Password Expiry (days)"
                  type="number"
                  value={securitySettings.passwordExpiry}
                  onChange={handleSecurityChange("passwordExpiry")}
                  onBlur={() => handleTextFieldSave("passwordExpiry")}
                  size={isMobile ? "small" : "medium"}
                  InputProps={{ inputProps: { min: 30, max: 365 } }}
                  helperText="How often passwords must be changed"
                />
              </Box>

              <Box>
                <TextField
                  fullWidth
                  label="IP Whitelist"
                  multiline
                  rows={isMobile ? 2 : 3}
                  value={securitySettings.ipWhitelist}
                  onChange={handleSecurityChange("ipWhitelist")}
                  onBlur={() => handleTextFieldSave("ipWhitelist")}
                  size={isMobile ? "small" : "medium"}
                  placeholder="192.168.1.1&#10;10.0.0.1&#10;203.0.113.1"
                  helperText="Enter IP addresses, one per line. Leave empty to allow all IPs."
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Security Recommendations */}
      <Box sx={{ flex: "1 1 100%" }}>
        <Card>
          <CardHeader
            title="Security Recommendations"
            titleTypographyProps={{
              sx: {
                fontSize: { xs: "1.1rem", sm: "1.25rem" },
              },
            }}
          />
          <CardContent>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {!securitySettings.twoFactorEnabled && (
                <Box
                  sx={{
                    flex: {
                      xs: "1 1 100%",
                      sm: "1 1 calc(50% - 8px)",
                      md: "1 1 calc(33.33% - 12px)",
                    },
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <WarningIcon color="warning" />
                    <Typography variant="body2">
                      Enable Two-Factor Authentication
                    </Typography>
                  </Box>
                </Box>
              )}

              {securitySettings.sessionTimeout > 120 && (
                <Box
                  sx={{
                    flex: {
                      xs: "1 1 100%",
                      sm: "1 1 calc(50% - 8px)",
                      md: "1 1 calc(33.33% - 12px)",
                    },
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <WarningIcon color="warning" />
                    <Typography variant="body2">
                      Consider shorter session timeout
                    </Typography>
                  </Box>
                </Box>
              )}

              {securitySettings.passwordExpiry > 90 && (
                <Box
                  sx={{
                    flex: {
                      xs: "1 1 100%",
                      sm: "1 1 calc(50% - 8px)",
                      md: "1 1 calc(33.33% - 12px)",
                    },
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <WarningIcon color="warning" />
                    <Typography variant="body2">
                      Consider shorter password expiry
                    </Typography>
                  </Box>
                </Box>
              )}

              {securitySettings.twoFactorEnabled &&
                securitySettings.sessionTimeout <= 60 &&
                securitySettings.passwordExpiry <= 90 && (
                  <Box sx={{ flex: "1 1 100%" }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <ShieldIcon color="success" />
                      <Typography variant="body2" color="success.main">
                        Your security settings look great! Keep up the good
                        work.
                      </Typography>
                    </Box>
                  </Box>
                )}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ flex: "1 1 100%" }}>
        <Card>
          <CardHeader
            title="Quick Actions"
            titleTypographyProps={{
              sx: {
                fontSize: { xs: "1.1rem", sm: "1.25rem" },
              },
            }}
          />
          <CardContent>
            <Box
              sx={{ display: "flex", flexWrap: "wrap", gap: { xs: 1, sm: 2 } }}
            >
              <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
                <Button
                  variant="outlined"
                  onClick={() => onSuccess("Session management coming soon!")}
                  fullWidth={isMobile}
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                >
                  {isMobile ? "Active Sessions" : "View Active Sessions"}
                </Button>
              </Box>
              <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
                <Button
                  variant="outlined"
                  onClick={() => onSuccess("Device management coming soon!")}
                  fullWidth={isMobile}
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                >
                  {isMobile ? "Trusted Devices" : "Manage Trusted Devices"}
                </Button>
              </Box>
              <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
                <Button
                  variant="outlined"
                  onClick={() => onSuccess("Activity log coming soon!")}
                  fullWidth={isMobile}
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                >
                  {isMobile ? "Security Log" : "View Security Log"}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default SecurityTab;
