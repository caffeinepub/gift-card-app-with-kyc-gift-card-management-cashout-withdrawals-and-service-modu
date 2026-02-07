import { useGetKycRecords, useSubmitKyc } from '../hooks/useQueries';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Alert, AlertDescription } from '../components/ui/alert';
import { CheckCircle, Clock, XCircle, Upload, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob } from '../backend';

export default function KycPage() {
  const { data: kycRecords = [], isLoading } = useGetKycRecords();
  const submitKyc = useSubmitKyc();

  const [documentType, setDocumentType] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const latestKyc = kycRecords[kycRecords.length - 1];
  const kycStatus = latestKyc?.status;

  const canSubmit = !kycStatus || kycStatus.__kind__ === 'rejected' || kycStatus.__kind__ === 'expired';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setDocumentFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!documentType || !idNumber || !documentFile) {
      toast.error('Please fill in all fields and upload a document');
      return;
    }

    try {
      // Convert file to bytes
      const arrayBuffer = await documentFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      // Create ExternalBlob with progress tracking
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      // Get the direct URL for storage
      const documentUri = blob.getDirectURL();

      await submitKyc.mutateAsync({
        documentType,
        documentUri,
        idNumber,
      });

      toast.success('KYC submitted successfully!');
      setDocumentType('');
      setIdNumber('');
      setDocumentFile(null);
      setUploadProgress(0);
    } catch (error) {
      toast.error('Failed to submit KYC');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">KYC Verification</h1>
        <p className="text-muted-foreground mt-2">
          Verify your identity to unlock withdrawals and full platform access
        </p>
      </div>

      {/* Current Status */}
      {kycStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {kycStatus.__kind__ === 'verified' && <CheckCircle className="h-5 w-5 text-green-500" />}
              {kycStatus.__kind__ === 'pending' && <Clock className="h-5 w-5 text-amber-500" />}
              {kycStatus.__kind__ === 'rejected' && <XCircle className="h-5 w-5 text-red-500" />}
              {kycStatus.__kind__ === 'expired' && <XCircle className="h-5 w-5 text-gray-500" />}
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Badge variant={
                  kycStatus.__kind__ === 'verified' ? 'default' :
                  kycStatus.__kind__ === 'pending' ? 'secondary' :
                  'destructive'
                } className="text-sm">
                  {kycStatus.__kind__.toUpperCase()}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  Document: {latestKyc.documentType}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submission Form */}
      {canSubmit && (
        <Card>
          <CardHeader>
            <CardTitle>Submit KYC Documents</CardTitle>
            <CardDescription>
              Upload a valid government-issued ID for verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="documentType">Document Type</Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger id="documentType">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="drivers_license">Driver's License</SelectItem>
                    <SelectItem value="national_id">National ID</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="idNumber">ID Number</Label>
                <Input
                  id="idNumber"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="Enter your ID number"
                  disabled={submitKyc.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="document">Upload Document</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    id="document"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={submitKyc.isPending}
                  />
                  <label htmlFor="document" className="cursor-pointer">
                    {documentFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">{documentFile.name}</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, PDF up to 5MB
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={submitKyc.isPending || !documentType || !idNumber || !documentFile}
              >
                {submitKyc.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit for Verification'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {!canSubmit && kycStatus?.__kind__ === 'pending' && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Your KYC documents are currently under review. This typically takes 1-2 business days.
          </AlertDescription>
        </Alert>
      )}

      {!canSubmit && kycStatus?.__kind__ === 'verified' && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Your identity has been verified! You now have full access to all platform features.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
