import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  Download, 
  Plus, 
  DollarSign, 
  Calendar, 
  FileText,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  Banknote
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth";

interface Payment {
  id: number;
  eventId: number;
  amount: string;
  platformFee: string;
  tax: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  invoiceUrl?: string;
  createdAt: string;
  completedAt?: string;
  event: {
    title: string;
    eventDate: string;
  };
  host: {
    name: string;
  };
  chef: {
    name: string;
  };
}

interface PaymentMethod {
  id: number;
  cardBrand: string;
  cardLast4: string;
  isDefault: boolean;
  createdAt: string;
}

export function PaymentDashboard() {
  const { user } = useAuth();
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [withdrawalError, setWithdrawalError] = useState("");
  const [externalPaymentMethod, setExternalPaymentMethod] = useState("");
  const [externalPaymentValue, setExternalPaymentValue] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositError, setDepositError] = useState("");
  const queryClient = useQueryClient();

  // Fetch payment history
  const { data: payments = [] } = useQuery({
    queryKey: ['/api/payments'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/payments', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch payments');
      return response.json();
    }
  });

  // Fetch payment methods
  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['/api/payment-methods'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/payment-methods', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch payment methods');
      return response.json();
    }
  });

  // Add payment method mutation
  const addPaymentMethodMutation = useMutation({
    mutationFn: async (data: { cardNumber: string; expiryMonth: string; expiryYear: string; cvc: string }) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to add payment method');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-methods'] });
      setIsAddCardOpen(false);
    },
  });

  // Remove payment method mutation
  const removePaymentMethodMutation = useMutation({
    mutationFn: async (paymentMethodId: number) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/payment-methods/${paymentMethodId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (!response.ok) throw new Error('Failed to remove payment method');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-methods'] });
    },
  });

  // Request withdrawal mutation (for chefs)
  const requestWithdrawalMutation = useMutation({
    mutationFn: async (amount: string) => {
      const numAmount = parseFloat(amount);
      if (numAmount < 100) {
        throw new Error('Minimum withdrawal is $100');
      }
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ amount }),
      });
      if (!response.ok) throw new Error('Failed to request withdrawal');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
      setWithdrawalAmount("");
      setWithdrawalError("");
    },
    onError: (error: any) => {
      setWithdrawalError(error.message);
    },
  });

  // Handle withdrawal validation
  const handleWithdrawalSubmit = () => {
    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      setWithdrawalError("Please enter a valid amount");
      return;
    }
    if (amount < 100) {
      setWithdrawalError("Minimum withdrawal is $100");
      return;
    }
    if (amount > (totalEarnings - totalFees)) {
      setWithdrawalError("Amount exceeds available balance");
      return;
    }
    
    setWithdrawalError("");
    requestWithdrawalMutation.mutate(withdrawalAmount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'refunded':
        return <ArrowDownLeft className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      pending: 'secondary',
      failed: 'destructive',
      refunded: 'outline',
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Calculate summary statistics
  const completedPayments = payments.filter((p: Payment) => p.status === 'completed');
  const totalEarnings = completedPayments.reduce((sum: number, p: Payment) => 
    sum + parseFloat(p.amount), 0
  );
  const totalFees = completedPayments.reduce((sum: number, p: Payment) => 
    sum + parseFloat(p.platformFee) + parseFloat(p.tax), 0
  );
  const pendingPayments = payments.filter((p: Payment) => p.status === 'pending');
  const upcomingPayouts = pendingPayments.reduce((sum: number, p: Payment) => 
    sum + parseFloat(p.amount), 0
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {user?.role === 'chef' ? 'Total Earnings' : 'Total Spent'}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From {completedPayments.length} completed transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalFees.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Including taxes and processing fees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {user?.role === 'chef' ? 'Pending Payouts' : 'Pending Payments'}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${upcomingPayouts.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {pendingPayments.length} pending transactions
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
          {user?.role === 'chef' && <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>}
          {user?.role === 'host' && <TabsTrigger value="deposits">Quick Deposits</TabsTrigger>}
        </TabsList>

        {/* Payment History */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                View all your {user?.role === 'chef' ? 'earnings' : 'payments'} and download invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments.map((payment: Payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        {user?.role === 'chef' ? (
                          <ArrowUpRight className="w-4 h-4 text-green-500" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      
                      <div>
                        <h4 className="font-medium">{payment.event.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>
                            {user?.role === 'chef' ? `From ${payment.host.name}` : `To ${payment.chef.name}`}
                          </span>
                          <span>•</span>
                          <span>{format(new Date(payment.event.eventDate), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-semibold">
                            ${parseFloat(payment.amount).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Fee: ${(parseFloat(payment.platformFee) + parseFloat(payment.tax)).toFixed(2)}
                          </div>
                        </div>
                        
                        {getStatusBadge(payment.status)}
                        
                        {payment.invoiceUrl && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={payment.invoiceUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {payments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>No payment history yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Methods */}
        <TabsContent value="methods" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Saved Payment Methods</CardTitle>
                <CardDescription>
                  Manage your credit cards and payment methods
                </CardDescription>
              </div>
              
              <Dialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Card
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Payment Method</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="card-number">Card Number</Label>
                        <Input id="card-number" placeholder="1234 5678 9012 3456" />
                      </div>
                      <div>
                        <Label htmlFor="expiry-month">Expiry Month</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => (
                              <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                {String(i + 1).padStart(2, '0')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="expiry-year">Expiry Year</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => {
                              const year = new Date().getFullYear() + i;
                              return (
                                <SelectItem key={year} value={String(year)}>
                                  {year}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="cvc">CVC</Label>
                        <Input id="cvc" placeholder="123" maxLength={4} />
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddCardOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => {
                          // In real implementation, this would integrate with Stripe
                          setIsAddCardOpen(false);
                        }}
                      >
                        Add Card
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.map((method: PaymentMethod) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <CreditCard className="w-8 h-8 text-gray-400" />
                      <div>
                        <h4 className="font-medium">
                          {method.cardBrand.toUpperCase()} •••• {method.cardLast4}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Added {format(new Date(method.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                      {method.isDefault && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removePaymentMethodMutation.mutate(method.id)}
                      disabled={removePaymentMethodMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                {paymentMethods.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CreditCard className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>No payment methods saved</p>
                    <p className="text-sm">Add a card to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Withdrawals (Chef only) */}
        {user?.role === 'chef' && (
          <TabsContent value="withdrawals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Withdraw Earnings</CardTitle>
                <CardDescription>
                  Request withdrawals from your available balance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Banknote className="w-5 h-5 text-green-600" />
                    <h4 className="font-medium text-green-900">Available Balance</h4>
                  </div>
                  <div className="text-2xl font-bold text-green-900">
                    ${(totalEarnings - totalFees).toFixed(2)}
                  </div>
                  <p className="text-sm text-green-700">
                    Ready for withdrawal
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="withdrawal-amount">Withdrawal Amount</Label>
                    <Input
                      id="withdrawal-amount"
                      type="number"
                      placeholder="0.00"
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                      min="0"
                      max={totalEarnings - totalFees}
                      step="0.01"
                    />
                  </div>
                  
                  {withdrawalError && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                      {withdrawalError}
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleWithdrawalSubmit}
                    disabled={!withdrawalAmount || parseFloat(withdrawalAmount) <= 0 || requestWithdrawalMutation.isPending}
                    className="w-full"
                  >
                    {requestWithdrawalMutation.isPending ? 'Processing...' : 'Request Withdrawal'}
                  </Button>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Withdrawal Information</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Withdrawals are processed within 2-3 business days</p>
                    <p>• Minimum withdrawal amount is $100.00</p>
                    <p>• Funds will be transferred to your linked bank account</p>
                    <p>• You'll receive an email confirmation once processed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Get Paid Faster Section */}
            <Card>
              <CardHeader>
                <CardTitle>Get Paid Faster</CardTitle>
                <CardDescription>
                  Link external payment methods for faster transactions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="payment-method">Payment Method</Label>
                    <Select value={externalPaymentMethod} onValueChange={setExternalPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zelle">Zelle</SelectItem>
                        <SelectItem value="cashapp">CashApp</SelectItem>
                        <SelectItem value="venmo">Venmo</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="payment-value">Account/Email/Phone</Label>
                    <Input
                      id="payment-value"
                      placeholder="Enter account details"
                      value={externalPaymentValue}
                      onChange={(e) => setExternalPaymentValue(e.target.value)}
                    />
                  </div>
                </div>
                
                <Button 
                  disabled={!externalPaymentMethod || !externalPaymentValue}
                  className="w-full"
                  onClick={() => {
                    // Save external payment method
                    setExternalPaymentMethod("");
                    setExternalPaymentValue("");
                  }}
                >
                  Link Payment Method
                </Button>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="font-semibold text-blue-600">Zelle</div>
                    <div className="text-xs text-gray-500">Instant transfer</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="font-semibold text-green-600">CashApp</div>
                    <div className="text-xs text-gray-500">Quick payments</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="font-semibold text-blue-500">Venmo</div>
                    <div className="text-xs text-gray-500">Social payments</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="font-semibold text-indigo-600">PayPal</div>
                    <div className="text-xs text-gray-500">Global payments</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Quick Deposits (Host only) */}
        {user?.role === 'host' && (
          <TabsContent value="deposits" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Deposit</CardTitle>
                <CardDescription>
                  Add funds to your account for event bookings and deposits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Banknote className="w-5 h-5 text-blue-600" />
                    <h4 className="font-medium text-blue-900">Account Balance</h4>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    ${(totalEarnings - totalFees).toFixed(2)}
                  </div>
                  <p className="text-sm text-blue-700">
                    Available for event bookings
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="deposit-amount">Deposit Amount</Label>
                    <Input
                      id="deposit-amount"
                      type="number"
                      placeholder="0.00"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  {depositError && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                      {depositError}
                    </div>
                  )}
                  
                  <Button 
                    onClick={() => {
                      // Handle deposit logic
                      setDepositAmount("");
                    }}
                    disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                    className="w-full"
                  >
                    Add Funds
                  </Button>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Deposit Information</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Funds are available immediately for bookings</p>
                    <p>• No minimum deposit amount required</p>
                    <p>• Secure processing with bank-level encryption</p>
                    <p>• You'll receive an email confirmation once processed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Deposit Faster Section */}
            <Card>
              <CardHeader>
                <CardTitle>Deposit Faster</CardTitle>
                <CardDescription>
                  Link external payment methods for quicker deposits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="host-payment-method">Payment Method</Label>
                    <Select value={externalPaymentMethod} onValueChange={setExternalPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zelle">Zelle</SelectItem>
                        <SelectItem value="cashapp">CashApp</SelectItem>
                        <SelectItem value="venmo">Venmo</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="host-payment-value">Account/Email/Phone</Label>
                    <Input
                      id="host-payment-value"
                      placeholder="Enter account details"
                      value={externalPaymentValue}
                      onChange={(e) => setExternalPaymentValue(e.target.value)}
                    />
                  </div>
                </div>
                
                <Button 
                  disabled={!externalPaymentMethod || !externalPaymentValue}
                  className="w-full"
                  onClick={() => {
                    // Save external payment method for deposits
                    setExternalPaymentMethod("");
                    setExternalPaymentValue("");
                  }}
                >
                  Link Payment Method
                </Button>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="font-semibold text-blue-600">Zelle</div>
                    <div className="text-xs text-gray-500">Instant deposits</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="font-semibold text-green-600">CashApp</div>
                    <div className="text-xs text-gray-500">Quick deposits</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="font-semibold text-blue-500">Venmo</div>
                    <div className="text-xs text-gray-500">Social payments</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="font-semibold text-indigo-600">PayPal</div>
                    <div className="text-xs text-gray-500">Global payments</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}