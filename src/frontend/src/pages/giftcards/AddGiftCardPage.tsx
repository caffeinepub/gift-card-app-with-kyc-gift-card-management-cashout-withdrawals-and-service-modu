import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAddGiftCard } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ArrowLeft, Loader2, Image as ImageIcon, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Currency } from '../../types/app-types';
import SelectGiftCardCategoryPicker from '../../components/giftcards/SelectGiftCardCategoryPicker';
import NGNRateInlineSummary from '../../components/giftcards/NGNRateInlineSummary';
import { computeNGNRateTier } from './addGiftCardNGNRate';

export default function AddGiftCardPage() {
  const navigate = useNavigate();
  const addGiftCard = useAddGiftCard();

  const [brand, setBrand] = useState('');
  const [showBrandPicker, setShowBrandPicker] = useState(false);
  const [currency, setCurrency] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [code, setCode] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Compute NGN rate tier when brand and amount change
  const matchedTier = useMemo(() => {
    if (!brand || !amount) return null;
    return computeNGNRateTier(brand, amount);
  }, [brand, amount]);

  // Show rate summary when brand is selected and amount is entered
  const shouldShowRateSummary = brand && amount && parseFloat(amount) > 0;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!brand) {
      toast.error('Please select a gift card brand');
      return;
    }

    if (!currency || !amount || !code) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      let imageBlob: any | null = null;

      if (imageFile) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        // Use real ExternalBlob from backend when blob-storage is available
        // For now, pass the bytes directly
        imageBlob = bytes;
        setUploadProgress(100);
      }

      const currencyObj: Currency = 
        currency === 'usd' ? { __kind__: 'usd', usd: null } :
        currency === 'kes' ? { __kind__: 'kes', kes: null } :
        currency === 'ngn' ? { __kind__: 'ngn', ngn: null } :
        currency === 'inr' ? { __kind__: 'inr', inr: null } :
        { __kind__: 'custom', custom: currency };

      await addGiftCard.mutateAsync({
        brand,
        currency: currencyObj,
        amount: BigInt(Math.floor(parseFloat(amount) * 100)),
        code,
        image: imageBlob,
      });

      toast.success('Gift card added successfully!');
      navigate({ to: '/gift-cards' });
    } catch (error: any) {
      if (error.message === 'Backend method not implemented') {
        toast.error('Gift card storage is not yet implemented in the backend');
      } else {
        toast.error('Failed to add gift card');
      }
      console.error(error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate({ to: '/gift-cards' })}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Gift Cards
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Add Gift Card</CardTitle>
          <CardDescription>
            Upload a new gift card to your collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand *</Label>
              <button
                type="button"
                onClick={() => setShowBrandPicker(true)}
                disabled={addGiftCard.isPending}
                className="w-full flex items-center justify-between px-3 py-2 border border-input bg-background rounded-md text-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className={brand ? 'text-foreground' : 'text-muted-foreground'}>
                  {brand || 'Select gift card brand'}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency *</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD</SelectItem>
                    <SelectItem value="kes">KES</SelectItem>
                    <SelectItem value="ngn">NGN</SelectItem>
                    <SelectItem value="inr">INR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100.00"
                  disabled={addGiftCard.isPending}
                />
              </div>
            </div>

            {/* NGN Rate Inline Summary */}
            {shouldShowRateSummary && (
              <NGNRateInlineSummary 
                matchedTier={matchedTier} 
                showUnavailable={!matchedTier}
              />
            )}

            <div className="space-y-2">
              <Label htmlFor="code">Card Code *</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter the gift card code"
                disabled={addGiftCard.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Card Image (Optional)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={addGiftCard.isPending}
                />
                <label htmlFor="image" className="cursor-pointer">
                  {imagePreview ? (
                    <div className="space-y-2">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <p className="text-sm text-muted-foreground">
                        Click to change image
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload card image
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG up to 5MB
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
              disabled={addGiftCard.isPending}
            >
              {addGiftCard.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Card...
                </>
              ) : (
                'Add Gift Card'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <SelectGiftCardCategoryPicker
        open={showBrandPicker}
        onOpenChange={setShowBrandPicker}
        onSelect={setBrand}
      />
    </div>
  );
}
