import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
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
import { PaymentMethodSelector } from "./payment-method-selector";

// Payment method icons
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
  paymentType: 'Venmo' | 'CashApp' | 'Zelle' | 'PayPal';
  accountIdentifier: string;
  isDefault: boolean;
  createdAt: string;
}

export function PaymentDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddMethodOpen, setIsAddMethodOpen] = useState(false);

  // Fetch payments
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
    mutationFn: async (data: { paymentType: string; accountIdentifier: string }) => {
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
      setIsAddMethodOpen(false);
    },
  });

  // Remove payment method mutation
  const removePaymentMethodMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/payment-methods/${id}`, {
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

  const handleAddPaymentMethod = (paymentType: string, accountIdentifier: string) => {
    addPaymentMethodMutation.mutate({ paymentType, accountIdentifier });
  };

  const formatAmount = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate totals
  const completedPayments = payments.filter((p: Payment) => p.status === 'completed');
  const totalEarnings = completedPayments.reduce((sum: number, p: Payment) => sum + parseFloat(p.amount), 0);
  const totalFees = completedPayments.reduce((sum: number, p: Payment) => sum + parseFloat(p.platformFee), 0);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {user?.role === 'chef' ? 'Total Earnings' : 'Total Spent'}
                </p>
                <p className="text-2xl font-bold">{formatAmount(totalEarnings.toString())}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Banknote className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Platform Fees</p>
                <p className="text-2xl font-bold">{formatAmount(totalFees.toString())}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-2xl font-bold">{payments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="methods" className="space-y-6">
        <TabsList>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="methods" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  {user?.role === 'chef' 
                    ? 'Manage how you receive payments from completed bookings'
                    : 'Manage your payment methods for booking deposits and payments'
                  }
                </CardDescription>
              </div>
              <Dialog open={isAddMethodOpen} onOpenChange={setIsAddMethodOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Method
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Add Payment Method</DialogTitle>
                  </DialogHeader>
                  <PaymentMethodSelector
                    onSave={handleAddPaymentMethod}
                    onCancel={() => setIsAddMethodOpen(false)}
                    isLoading={addPaymentMethodMutation.isPending}
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.length === 0 ? (
                  <div className="text-center py-12">
                    <Banknote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No payment methods</h3>
                    <p className="text-gray-500 mb-4">
                      Add a payment method to {user?.role === 'chef' ? 'receive payments' : 'make payments'}
                    </p>
                    <Button onClick={() => setIsAddMethodOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </div>
                ) : (
                  paymentMethods.map((method: PaymentMethod) => {
                    const Icon = PaymentIcons[method.paymentType];
                    return (
                      <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Icon />
                          <div>
                            <h4 className="font-medium">{method.paymentType}</h4>
                            <p className="text-sm text-gray-500">{method.accountIdentifier}</p>
                            <p className="text-xs text-gray-400">
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
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                View all your payment transactions and download invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
                    <p className="text-gray-500">
                      Your payment history will appear here once you start booking events
                    </p>
                  </div>
                ) : (
                  payments.map((payment: Payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(payment.status)}
                          {user?.role === 'chef' ? (
                            <ArrowDownLeft className="w-4 h-4 text-green-500" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{payment.event.title}</h4>
                          <p className="text-sm text-gray-500">
                            {user?.role === 'chef' ? `From ${payment.host.name}` : `To ${payment.chef.name}`}
                          </p>
                          <p className="text-xs text-gray-400">
                            {format(new Date(payment.createdAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium">{formatAmount(payment.amount)}</p>
                        <Badge variant="secondary" className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                        {payment.invoiceUrl && (
                          <Button variant="ghost" size="sm" className="mt-2">
                            <Download className="w-4 h-4 mr-2" />
                            Invoice
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}