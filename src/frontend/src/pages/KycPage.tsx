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
    } catch (error: any) {
      if (error.message?.includes('Address verification is not yet supported')) {
        toast.error('Address verification is not yet supported. Please select another document type.');
      } else {
        toast.error('Failed to submit KYC');
      }
      console.error(error);
    }
  };

  const getIdNumberLabel = () => {
    if (documentType === 'address_verification') {
      return 'Reference Number';
    }
    return 'ID Number';
  };

  const getIdNumberPlaceholder = () => {
    if (documentType === 'address_verification') {
      return 'Enter reference number';
    }
    return 'Enter ID number';
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
                  {kycStatus.__kind__ === 'verified' && 'Your identity has been verified'}
                  {kycStatus.__kind__ === 'pending' && 'Your submission is under review'}
                  {kycStatus.__kind__ === 'rejected' && 'Your submission was rejected. Please submit again.'}
                  {kycStatus.__kind__ === 'expired' && 'Your verification has expired. Please submit again.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Form */}
      {canSubmit && (
        <Card>
          <CardHeader>
            <CardTitle>Submit KYC Documents</CardTitle>
            <CardDescription>
              Upload your identity documents for verification
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
                    <SelectItem value="nin">NIN</SelectItem>
                    <SelectItem value="id_card">ID card</SelectItem>
                    <SelectItem value="voters_card">Voter's card</SelectItem>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="address_verification">Address verification</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="idNumber">{getIdNumberLabel()}</Label>
                <Input
                  id="idNumber"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder={getIdNumberPlaceholder()}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="document">Upload Document</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="document"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  {documentFile && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {documentFile.name}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Accepted formats: Images and PDF (max 5MB)
                </p>
              </div>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
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
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Submit KYC
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {!canSubmit && kycStatus?.__kind__ === 'verified' && (
        <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Your identity has been verified. You now have full access to all platform features.
          </AlertDescription>
        </Alert>
      )}

      {!canSubmit && kycStatus?.__kind__ === 'pending' && (
        <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
          <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            Your KYC submission is currently under review. We'll notify you once it's processed.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
