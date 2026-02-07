import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { RateTable, formatTierLabel, formatNGNRate } from '../../config/giftCardRatesNGN';

interface GiftCardRateTableProps {
  brandName: string;
  rateTable: RateTable;
}

export default function GiftCardRateTable({ brandName, rateTable }: GiftCardRateTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate Table</CardTitle>
        <CardDescription>
          Nigeria (NGN) rates for {brandName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rateTable.tiers.map((tier, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {formatTierLabel(tier)}
                </TableCell>
                <TableCell className="text-right">
                  {formatNGNRate(tier.ratePerDollar)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
