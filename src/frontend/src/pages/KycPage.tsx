import { useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetKycStatus, useSubmitKyc } from '../hooks/useQueries';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Loader2, CheckCircle2, Clock, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob } from '../backend';
import DocumentSignatureOverlay from '../components/kyc/DocumentSignatureOverlay';

export default function KycPage() {
  const navigate = useNavigate();
  const { data: kycRecords, isLoading } = useGetKycStatus();
  const submitKyc = useSubmitKyc();

  const [documentType, setDocumentType] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const exportSignatureRef = useRef<(() => Promise<Blob | null>) | null>(null);

  const latestRecord = kycRecords && kycRecords.length > 0 ? kycRecords[kycRecords.length - 1] : null;
  const latestStatus = latestRecord?.status.__kind__;

  const canSubmit = !latestStatus || latestStatus === 'rejected' || latestStatus === 'expired';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a JPEG, PNG, or PDF file.');
      return;
    }

    setDocumentFile(file);
    setHasSignature(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!documentType || !idNumber || !documentFile) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (documentFile.type.startsWith('image/') && !hasSignature) {
      toast.error('Please sign the document before submitting');
      return;
    }

    try {
      const fileBytes = await documentFile.arrayBuffer();
      const documentBlob = ExternalBlob.fromBytes(new Uint8Array(fileBytes));

      let signatureBlob: ExternalBlob | null = null;
      if (documentFile.type.startsWith('image/') && exportSignatureRef.current) {
        const signatureData = await exportSignatureRef.current();
        if (signatureData) {
          const signatureBytes = await signatureData.arrayBuffer();
          signatureBlob = ExternalBlob.fromBytes(new Uint8Array(signatureBytes));
        }
      }

      await submitKyc.mutateAsync({
        documentType,
        idNumber,
        documentUri: documentBlob.getDirectURL(),
        signature: signatureBlob,
      });

      toast.success('KYC document submitted successfully');
      setDocumentType('');
      setIdNumber('');
      setDocumentFile(null);
      setHasSignature(false);
    } catch (error: any) {
      console.error('KYC submission error:', error);
      toast.error(error.message || 'Failed to submit KYC document');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: '/' })}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">KYC Verification</h1>
          <p className="text-sm text-muted-foreground">
            Complete your identity verification to unlock withdrawals
          </p>
        </div>
      </div>

      {latestStatus === 'pending' && (
        <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-900 dark:text-blue-100">Verification Pending</AlertTitle>
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            Your KYC document is under review. <strong>Typical review time: 5–15 minutes.</strong> You'll be notified once the verification is complete.
          </AlertDescription>
        </Alert>
      )}

      {latestStatus === 'verified' && (
        <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          <AlertTitle className="text-green-900 dark:text-green-100">Verification Complete</AlertTitle>
          <AlertDescription className="text-green-800 dark:text-green-200">
            Your identity has been verified. You now have full access to all features including withdrawals.
          </AlertDescription>
        </Alert>
      )}

      {latestStatus === 'rejected' && (
        <Alert variant="destructive">
          <XCircle className="h-5 w-5" />
          <AlertTitle>Verification Rejected</AlertTitle>
          <AlertDescription>
            Your KYC document was rejected. Please review the requirements and submit a new document.
          </AlertDescription>
        </Alert>
      )}

      {latestStatus === 'expired' && (
        <Alert className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <AlertTitle className="text-yellow-900 dark:text-yellow-100">Verification Expired</AlertTitle>
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            Your KYC verification has expired. Please submit a new document to regain access.
          </AlertDescription>
        </Alert>
      )}

      {canSubmit && (
        <Card>
          <CardHeader>
            <CardTitle>Submit Verification Document</CardTitle>
            <CardDescription>
              Upload a clear photo or scan of your government-issued ID
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
                    <SelectItem value="nin">National ID (NIN)</SelectItem>
                    <SelectItem value="id_card">Driver's License</SelectItem>
                    <SelectItem value="voters_card">Voter's Card</SelectItem>
                    <SelectItem value="passport">International Passport</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="idNumber">ID Number</Label>
                <Input
                  id="idNumber"
                  type="text"
                  placeholder="Enter your ID number"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="document">Upload Document</Label>
                <Input
                  id="document"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  onChange={handleFileChange}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Accepted formats: JPEG, PNG, PDF (max 10MB)
                </p>
              </div>

              {documentFile && documentFile.type.startsWith('image/') && (
                <DocumentSignatureOverlay
                  imageFile={documentFile}
                  onSignatureChange={setHasSignature}
                  onExportSignature={exportSignatureRef as any}
                />
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={submitKyc.isPending || (documentFile?.type.startsWith('image/') && !hasSignature)}
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

      {kycRecords && kycRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Verification History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {kycRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{record.documentType}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(Number(record.submittedAt) / 1000000).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {record.status.__kind__ === 'pending' && (
                      <span className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400">
                        <Clock className="h-4 w-4" />
                        Pending
                      </span>
                    )}
                    {record.status.__kind__ === 'verified' && (
                      <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-4 w-4" />
                        Verified
                      </span>
                    )}
                    {record.status.__kind__ === 'rejected' && (
                      <span className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                        <XCircle className="h-4 w-4" />
                        Rejected
                      </span>
                    )}
                    {record.status.__kind__ === 'expired' && (
                      <span className="flex items-center gap-1 text-sm text-yellow-600 dark:text-yellow-400">
                        <AlertCircle className="h-4 w-4" />
                        Expired
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
