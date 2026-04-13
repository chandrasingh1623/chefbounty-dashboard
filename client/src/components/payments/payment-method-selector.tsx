import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

// Payment method icons (using simple SVG representations)
const PaymentIcons = {
  Venmo: () => (
    <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
      <span className="text-white font-bold text-sm">V</span>
    </div>
  ),
  CashApp: () => (
    <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
      <span className="text-white font-bold text-sm">$</span>
    </div>
  ),
  Zelle: () => (
    <div className="w-8 h-8 bg-purple-500 rounded flex items-center justify-center">
      <span className="text-white font-bold text-sm">Z</span>
    </div>
  ),
  PayPal: () => (
    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
      <span className="text-white font-bold text-sm">P</span>
    </div>
  ),
};

const paymentMethods = [
  {
    type: 'Venmo',
    placeholder: '@yourVenmoHandle',
    label: 'Venmo Username',
    description: 'Enter your Venmo username (starts with @)',
  },
  {
    type: 'CashApp',
    placeholder: '$yourCashAppTag',
    label: 'CashApp Tag',
    description: 'Enter your CashApp tag (starts with $)',
  },
  {
    type: 'Zelle',
    placeholder: 'email@domain.com',
    label: 'Email Address',
    description: 'Enter your email address linked to Zelle',
  },
  {
    type: 'PayPal',
    placeholder: 'email@paypal.com',
    label: 'PayPal Email',
    description: 'Enter your PayPal email address',
  },
];

interface PaymentMethodSelectorProps {
  onSave: (paymentType: string, accountIdentifier: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PaymentMethodSelector({ onSave, onCancel, isLoading }: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [accountIdentifier, setAccountIdentifier] = useState('');

  const handleSave = () => {
    if (selectedMethod && accountIdentifier.trim()) {
      onSave(selectedMethod, accountIdentifier.trim());
    }
  };

  const selectedPaymentMethod = paymentMethods.find(method => method.type === selectedMethod);

  const validateInput = (value: string, type: string) => {
    switch (type) {
      case 'Venmo':
        return value.startsWith('@') && value.length > 1;
      case 'CashApp':
        return value.startsWith('$') && value.length > 1;
      case 'Zelle':
      case 'PayPal':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      default:
        return false;
    }
  };

  const isValidInput = selectedMethod && accountIdentifier.trim() && 
                     validateInput(accountIdentifier.trim(), selectedMethod);

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium mb-4 block">
          Select Payment Method
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {paymentMethods.map((method) => {
            const Icon = PaymentIcons[method.type as keyof typeof PaymentIcons];
            const isSelected = selectedMethod === method.type;
            
            return (
              <Card
                key={method.type}
                className={`cursor-pointer transition-all hover:border-blue-500 hover:bg-blue-50 ${
                  isSelected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : ''
                }`}
                onClick={() => setSelectedMethod(method.type)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <Icon />
                  <div className="flex-1">
                    <div className="font-medium">{method.type}</div>
                  </div>
                  {isSelected && (
                    <Check className="w-5 h-5 text-blue-500" />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {selectedPaymentMethod && (
        <div className="space-y-2">
          <Label htmlFor="accountIdentifier" className="text-sm font-medium">
            {selectedPaymentMethod.label}
          </Label>
          <Input
            id="accountIdentifier"
            placeholder={selectedPaymentMethod.placeholder}
            value={accountIdentifier}
            onChange={(e) => setAccountIdentifier(e.target.value)}
            className={`${
              accountIdentifier && !validateInput(accountIdentifier, selectedMethod)
                ? 'border-red-500 focus:border-red-500'
                : ''
            }`}
          />
          <p className="text-xs text-gray-500">
            {selectedPaymentMethod.description}
          </p>
          {accountIdentifier && !validateInput(accountIdentifier, selectedMethod) && (
            <p className="text-xs text-red-500">
              Please enter a valid {selectedPaymentMethod.label.toLowerCase()}
            </p>
          )}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          disabled={!isValidInput || isLoading}
        >
          {isLoading ? 'Adding...' : 'Add Payment Method'}
        </Button>
      </div>
    </div>
  );
}