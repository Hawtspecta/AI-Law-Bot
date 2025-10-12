import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ClipboardList, 
  ArrowLeft, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  Info,
  FileText,
  Shield
} from "lucide-react";
import { apiClient } from "@/services/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const FormAssistance = () => {
  const navigate = useNavigate();
  const [formType, setFormType] = useState("consumer-complaint");
  const [userInputs, setUserInputs] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    complaint: "",
    amount: "",
    productName: "",
    purchaseDate: "",
    merchantName: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const formTypes = [
    { value: "consumer-complaint", label: "Consumer Complaint Form" },
    { value: "rti-application", label: "RTI Application" },
    { value: "property-registration", label: "Property Registration" },
    { value: "marriage-registration", label: "Marriage Registration" },
    { value: "employment-contract", label: "Employment Contract" },
    { value: "rental-agreement", label: "Rental Agreement" }
  ];

  const handleAnalyze = async () => {
    if (!userInputs.name || !userInputs.email) {
      toast.error("Please fill in required fields (Name and Email)");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.fillForm({
        formType: formType,
        userInputs: userInputs,
        conditions: {
          validateEmail: true,
          requireAmount: formType === "consumer-complaint",
          validateDate: true,
          requireAddress: true
        }
      });

      setResults(response);
      toast.success("Form analysis completed!");
    } catch (error) {
      console.error("Form analysis error:", error);
      toast.error("Failed to analyze form");
    } finally {
      setIsLoading(false);
    }
  };

  const getValidationColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'valid': return 'text-green-600 bg-green-50 border-green-200';
      case 'invalid': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getValidationIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'valid': return <CheckCircle className="h-4 w-4" />;
      case 'invalid': return <AlertCircle className="h-4 w-4" />;
      case 'warning': return <AlertCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
              <div className="flex items-center space-x-2">
                <ClipboardList className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold text-primary">Form Assistance</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Form Section */}
          <Card className="p-6 mb-8">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Legal Form Assistance</h2>
                <p className="text-muted-foreground">
                  Get AI-powered assistance with legal form filling, validation, and error minimization.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Form Type</label>
                  <Select value={formType} onValueChange={setFormType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select form type" />
                    </SelectTrigger>
                    <SelectContent>
                      {formTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Full Name *</label>
                    <Input
                      value={userInputs.name}
                      onChange={(e) => setUserInputs({...userInputs, name: e.target.value})}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email *</label>
                    <Input
                      type="email"
                      value={userInputs.email}
                      onChange={(e) => setUserInputs({...userInputs, email: e.target.value})}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Phone</label>
                    <Input
                      value={userInputs.phone}
                      onChange={(e) => setUserInputs({...userInputs, phone: e.target.value})}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Address</label>
                    <Input
                      value={userInputs.address}
                      onChange={(e) => setUserInputs({...userInputs, address: e.target.value})}
                      placeholder="Enter your address"
                    />
                  </div>
                </div>

                {formType === "consumer-complaint" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Complaint Description *</label>
                      <Textarea
                        value={userInputs.complaint}
                        onChange={(e) => setUserInputs({...userInputs, complaint: e.target.value})}
                        placeholder="Describe your complaint in detail"
                        className="min-h-[100px]"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Amount Involved</label>
                        <Input
                          value={userInputs.amount}
                          onChange={(e) => setUserInputs({...userInputs, amount: e.target.value})}
                          placeholder="Enter amount"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Product/Service Name</label>
                        <Input
                          value={userInputs.productName}
                          onChange={(e) => setUserInputs({...userInputs, productName: e.target.value})}
                          placeholder="Enter product/service name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Purchase Date</label>
                        <Input
                          type="date"
                          value={userInputs.purchaseDate}
                          onChange={(e) => setUserInputs({...userInputs, purchaseDate: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Merchant Name</label>
                        <Input
                          value={userInputs.merchantName}
                          onChange={(e) => setUserInputs({...userInputs, merchantName: e.target.value})}
                          placeholder="Enter merchant name"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <Button onClick={handleAnalyze} disabled={isLoading || !userInputs.name || !userInputs.email}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <ClipboardList className="h-4 w-4 mr-2" />
                      Analyze Form
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Results Section */}
          {isLoading && (
            <Card className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Performing logic-based validation...</p>
            </Card>
          )}

          {results && !isLoading && (
            <div className="space-y-6">
              {/* Validation Results */}
              {results.filledForm.validationResults && results.filledForm.validationResults.length > 0 && (
                <Card className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Shield className="h-5 w-5 text-blue-500" />
                    <h3 className="text-lg font-semibold">Validation Results</h3>
                  </div>
                  <div className="space-y-3">
                    {results.filledForm.validationResults.map((validation: any, index: number) => (
                      <div key={index} className={`p-4 rounded-lg border ${getValidationColor(validation.status)}`}>
                        <div className="flex items-center space-x-2 mb-2">
                          {getValidationIcon(validation.status)}
                          <span className="font-medium">{validation.field}</span>
                          <span className="text-sm font-medium">{validation.status}</span>
                        </div>
                        <p className="text-sm">{validation.message}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Suggestions */}
              {results.filledForm.suggestions && results.filledForm.suggestions.length > 0 && (
                <Card className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Info className="h-5 w-5 text-green-500" />
                    <h3 className="text-lg font-semibold">AI Suggestions</h3>
                  </div>
                  <div className="space-y-2">
                    {results.filledForm.suggestions.map((suggestion: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Completed Form */}
              <Card className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Completed Form</h3>
                </div>
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: results.filledForm.completedForm.replace(/\n/g, '<br/>') }} />
                </div>
              </Card>

              {/* Citations */}
              {results.filledForm.citations && results.filledForm.citations.length > 0 && (
                <Card className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <h3 className="text-lg font-semibold">Legal References</h3>
                  </div>
                  <div className="space-y-2">
                    {results.filledForm.citations.map((citation: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{citation}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Features Info */}
          <Card className="p-6 mt-8">
            <div className="flex items-center space-x-2 mb-4">
              <Info className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold">Form Assistance Features</h3>
            </div>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">1</div>
                  <h4 className="font-semibold">Logic-Based Validation</h4>
                </div>
                <p className="text-muted-foreground">
                  Advanced validation logic checks form requirements against PostgreSQL database rules.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">2</div>
                  <h4 className="font-semibold">Form Requirement Checking</h4>
                </div>
                <p className="text-muted-foreground">
                  Ensures all mandatory fields are completed and meet legal requirements.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">3</div>
                  <h4 className="font-semibold">Error Minimization</h4>
                </div>
                <p className="text-muted-foreground">
                  AI-powered suggestions help minimize errors in document preparation.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">4</div>
                  <h4 className="font-semibold">Document Preparation</h4>
                </div>
                <p className="text-muted-foreground">
                  Automated form completion with legal compliance and best practices.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FormAssistance;
