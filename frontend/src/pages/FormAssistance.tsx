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

  Shield,

  Bot

} from "lucide-react";

import { apiClient } from "@/services/api";

import { toast } from "sonner";

import { useNavigate } from "react-router-dom";

import ToolNavigationSidebar from "@/components/ToolNavigationSidebar";



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



  const formFieldSchemas = {

    "consumer-complaint": {

      title: "Consumer Complaint Form",

      fields: [

        { key: "name", label: "Complainant Name", type: "text", required: true, hint: "Full legal name as per identity proof" },

        { key: "email", label: "Email Address", type: "email", required: true, hint: "Valid email for official correspondence" },

        { key: "phone", label: "Mobile Number", type: "text", required: false, hint: "Optional but recommended for service" },

        { key: "address", label: "Address", type: "text", required: false, hint: "Full postal address" },

        { key: "complaint", label: "Complaint Description", type: "textarea", required: true, hint: "State the grievance, dates, and relief sought" },

        { key: "amount", label: "Amount Involved (₹)", type: "text", required: false, hint: "Monetary loss or claimed amount" },

        { key: "productName", label: "Product or Service Name", type: "text", required: true, hint: "Name of the product/service causing the issue" },

        { key: "purchaseDate", label: "Purchase/Transaction Date", type: "date", required: true, hint: "Date of transaction or service availed" },

        { key: "merchantName", label: "Merchant/Service Provider Name", type: "text", required: true, hint: "Name of the business or provider" }

      ]

    },

    "rti-application": {

      title: "RTI Application",

      fields: [

        { key: "name", label: "Applicant Name", type: "text", required: true, hint: "Name of the person seeking information" },

        { key: "email", label: "Email Address", type: "email", required: true, hint: "Email for acknowledgement" },

        { key: "phone", label: "Mobile Number", type: "text", required: false, hint: "Phone number for follow-up" },

        { key: "address", label: "Postal Address", type: "text", required: true, hint: "Registered address for communication" },

        { key: "complaint", label: "Information Sought", type: "textarea", required: true, hint: "Specify the information, records, or documents sought" },

        { key: "productName", label: "Public Authority / Department", type: "text", required: true, hint: "Name of the public authority or department" },

        { key: "purchaseDate", label: "Date of Application", type: "date", required: true, hint: "Date of filing the application" },

        { key: "merchantName", label: "Reference Number (if any)", type: "text", required: false, hint: "Any file, docket, or reference number" }

      ]

    },

    "property-registration": {

      title: "Property Registration",

      fields: [

        { key: "name", label: "Owner/Applicant Name", type: "text", required: true, hint: "Name of the owner or transferee" },

        { key: "email", label: "Email Address", type: "email", required: true, hint: "Email for registration updates" },

        { key: "phone", label: "Phone Number", type: "text", required: false, hint: "Phone contact" },

        { key: "address", label: "Property Address", type: "text", required: true, hint: "Complete property location" },

        { key: "complaint", label: "Registration Purpose", type: "textarea", required: true, hint: "Describe the transfer, lease, or registration purpose" },

        { key: "amount", label: "Consideration Amount", type: "text", required: true, hint: "Declared value or consideration" },

        { key: "productName", label: "Property Type", type: "text", required: false, hint: "Residential, commercial, or agricultural" },

        { key: "purchaseDate", label: "Registration Date", type: "date", required: true, hint: "Proposed registration date" },

        { key: "merchantName", label: "Counterparty / Seller Name", type: "text", required: false, hint: "Seller, buyer, or developer name" }

      ]

    },

    "marriage-registration": {

      title: "Marriage Registration",

      fields: [

        { key: "name", label: "Bride Name", type: "text", required: true, hint: "Full name of bride" },

        { key: "email", label: "Email Address", type: "email", required: true, hint: "Email for notices and records" },

        { key: "phone", label: "Phone Number", type: "text", required: false, hint: "Contact number" },

        { key: "address", label: "Marriage Venue / Address", type: "text", required: true, hint: "Place where marriage is solemnized" },

        { key: "complaint", label: "Marriage Details", type: "textarea", required: true, hint: "Marriage date, religion, and relevant particulars" },

        { key: "productName", label: "Groom Name", type: "text", required: true, hint: "Full name of groom" },

        { key: "purchaseDate", label: "Marriage Date", type: "date", required: true, hint: "Date of marriage" },

        { key: "merchantName", label: "Witness Names", type: "text", required: false, hint: "Names of witnesses, if any" }

      ]

    },

    "employment-contract": {

      title: "Employment Contract",

      fields: [

        { key: "name", label: "Employer Name", type: "text", required: true, hint: "Legal name of employer" },

        { key: "email", label: "Employer Email", type: "email", required: true, hint: "Official employer email" },

        { key: "phone", label: "Employer Contact", type: "text", required: false, hint: "Company contact number" },

        { key: "address", label: "Place of Employment", type: "text", required: true, hint: "Office/branch location" },

        { key: "complaint", label: "Role and Responsibilities", type: "textarea", required: true, hint: "Describe duties, designation, and scope" },

        { key: "productName", label: "Employee Name", type: "text", required: true, hint: "Full name of employee" },

        { key: "purchaseDate", label: "Start Date", type: "date", required: true, hint: "Employment start date" },

        { key: "amount", label: "Salary / Consideration", type: "text", required: true, hint: "Compensation or remuneration" },

        { key: "merchantName", label: "Jurisdiction", type: "text", required: false, hint: "Applicable law and place of work" }

      ]

    },

    "rental-agreement": {

      title: "Rental Agreement",

      fields: [

        { key: "name", label: "Landlord Name", type: "text", required: true, hint: "Owner/landlord legal name" },

        { key: "email", label: "Email Address", type: "email", required: true, hint: "Email for notices" },

        { key: "phone", label: "Phone Number", type: "text", required: false, hint: "Contact number" },

        { key: "address", label: "Property Address", type: "text", required: true, hint: "Premises under lease" },

        { key: "complaint", label: "Tenancy Terms", type: "textarea", required: true, hint: "Rent, term, and occupancy terms" },

        { key: "amount", label: "Monthly Rent", type: "text", required: true, hint: "Rental amount in currency" },

        { key: "productName", label: "Tenant Name", type: "text", required: true, hint: "Name of tenant or occupant" },

        { key: "purchaseDate", label: "Lease Start Date", type: "date", required: true, hint: "Commencement date" },

        { key: "merchantName", label: "Lease End Date", type: "text", required: false, hint: "Expected end date or renewal term" }

      ]

    }

  };



  const activeFormSchema = formFieldSchemas[formType] || formFieldSchemas["consumer-complaint"];



  const handleAnalyze = async () => {

    const missingRequiredFields = activeFormSchema.fields.filter((field) => field.required && !String(userInputs[field.key] || "").trim());

    if (missingRequiredFields.length > 0) {

      toast.error(`Please complete the required fields: ${missingRequiredFields.map((field) => field.label).join(', ')}`);

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

        <div className="grid lg:grid-cols-[260px_minmax(0,1fr)] gap-8 items-start">

          <div className="hidden lg:block">
            <ToolNavigationSidebar />
          </div>

          <div className="min-w-0 w-full">

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



                <div className="space-y-4">

                  {activeFormSchema.fields.map((field) => (

                    <div key={field.key} className="space-y-2">

                      <div className="flex items-center justify-between">

                        <label className="text-sm font-medium block">{field.label}{field.required ? ' *' : ''}</label>

                        <span className="text-xs text-muted-foreground">{field.hint}</span>

                      </div>

                      {field.type === 'textarea' ? (

                        <Textarea

                          value={String(userInputs[field.key] || '')}

                          onChange={(e) => setUserInputs({...userInputs, [field.key]: e.target.value})}

                          placeholder={`Enter ${field.label.toLowerCase()}`}

                          className="min-h-[100px]"

                        />

                      ) : (

                        <Input

                          type={field.type === 'email' ? 'email' : field.type === 'date' ? 'date' : 'text'}

                          value={String(userInputs[field.key] || '')}

                          onChange={(e) => setUserInputs({...userInputs, [field.key]: e.target.value})}

                          placeholder={`Enter ${field.label.toLowerCase()}`}

                        />

                      )}

                    </div>

                  ))}

                </div>



                <Button onClick={handleAnalyze} disabled={isLoading || activeFormSchema.fields.filter((field) => field.required).some((field) => !String(userInputs[field.key] || '').trim())}>

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
            <div className="w-full bg-card border border-border/60 border-l-4 border-l-accent rounded-2xl rounded-tl-none shadow-sm p-6 space-y-6 text-left animate-scale-in">
              {/* Header */}
              <div className="border-b border-border/30 pb-3">
                <div className="flex items-center space-x-2">
                  <ClipboardList className="h-5 w-5 text-accent" />
                  <h3 className="text-lg font-heading font-semibold text-primary">Form Assistance Report</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Completed at {new Date(results.timestamp).toLocaleTimeString()}</p>
              </div>

              {/* Validation Results */}
              {results.filledForm.validationResults && results.filledForm.validationResults.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Validation Results</h4>
                  <div className="space-y-3">
                     {results.filledForm.validationResults.map((validation: any, index: number) => {
                      // Dynamically map technical field keys to human-friendly labels on the frontend
                      const schema = formFieldSchemas[formType as keyof typeof formFieldSchemas] || formFieldSchemas["consumer-complaint"];
                      
                      // Match by key or label
                      const fieldSchema = schema.fields.find((f: any) => 
                        f.key === validation.field || 
                        f.label.toLowerCase() === validation.field.toLowerCase() ||
                        f.key.toLowerCase() === validation.field.toLowerCase()
                      );
                      
                      const fieldLabel = fieldSchema ? fieldSchema.label : (validation.field.charAt(0).toUpperCase() + validation.field.slice(1).replace(/([A-Z])/g, ' $1'));
                      
                      // Perform client-side robust validation override
                      let validationStatus = validation.status;
                      let validationMessage = validation.message || '';
                      
                      if (fieldSchema) {
                        const rawValue = userInputs[fieldSchema.key];
                        const value = typeof rawValue === 'string' ? rawValue.trim() : rawValue;
                        const isPresent = value && String(value).length > 0;
                        
                        // 1. Required Check
                        if (fieldSchema.required && !isPresent) {
                          validationStatus = 'invalid';
                          validationMessage = `❌ ${fieldSchema.label} is required to fill out this legal form.`;
                        } 
                        // 2. Optional but Empty Check
                        else if (!isPresent) {
                          validationStatus = 'warning';
                          validationMessage = `⚠️ ${fieldSchema.label} is optional. Leave blank only if not applicable.`;
                        } 
                        // 3. Present field validations
                        else {
                          // Email validation
                          if (fieldSchema.type === 'email' || fieldSchema.key === 'email') {
                            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                            if (!emailRegex.test(String(value))) {
                              validationStatus = 'invalid';
                              validationMessage = `❌ ${fieldSchema.label} must be a valid email address format (e.g. name@example.com) for official legal records.`;
                            } else {
                              validationStatus = 'valid';
                              validationMessage = `✅ ${fieldSchema.label} is complete and verified.`;
                            }
                          }
                          
                          // Mobile / Phone validation
                          else if (fieldSchema.key === 'phone' || fieldSchema.label.toLowerCase().includes('phone') || fieldSchema.label.toLowerCase().includes('mobile')) {
                            const phoneDigits = String(value).replace(/\D/g, '');
                            if (phoneDigits.length < 10) {
                              validationStatus = 'invalid';
                              validationMessage = `❌ ${fieldSchema.label} must be a valid contact number with at least 10 digits.`;
                            } else {
                              validationStatus = 'valid';
                              validationMessage = `✅ ${fieldSchema.label} is complete and verified.`;
                            }
                          }
                          
                          // Amount numerical validation
                          else if (fieldSchema.key === 'amount' || fieldSchema.label.toLowerCase().includes('amount') || fieldSchema.label.toLowerCase().includes('salary')) {
                            const amountNum = parseFloat(String(value).replace(/[^0-9.]/g, ''));
                            if (isNaN(amountNum) || amountNum <= 0) {
                              validationStatus = 'invalid';
                              validationMessage = `❌ ${fieldSchema.label} must be a positive numerical amount.`;
                            } else {
                              validationStatus = 'valid';
                              validationMessage = `✅ ${fieldSchema.label} is complete and verified.`;
                            }
                          }
                          
                          // Default valid message if no override was triggered and it was marked valid
                          else if (validationStatus === 'valid') {
                            validationMessage = `✅ ${fieldSchema.label} is complete and verified.`;
                          }
                        }
                      }

                      // Also sanitize original message variables to ensure correct label terminology is used contextually
                      if (fieldSchema) {
                        validationMessage = validationMessage
                          .replace(new RegExp(`\\b${validation.field}\\b`, 'gi'), fieldSchema.label)
                          .replace(/Product or Service Name/gi, fieldSchema.label)
                          .replace(/Product Name/gi, fieldSchema.label)
                          .replace(/Complainant Name/gi, fieldSchema.label)
                          .replace(/Applicant Name/gi, fieldSchema.label)
                          .replace(/Owner \/ Applicant Name/gi, fieldSchema.label)
                          .replace(/Bride Name/gi, fieldSchema.label)
                          .replace(/Employer Name/gi, fieldSchema.label)
                          .replace(/Landlord Name/gi, fieldSchema.label);
                      }

                      return (
                        <div key={index} className={`p-4 rounded-xl border ${getValidationColor(validationStatus)} shadow-xs`}>
                          <div className="flex items-center space-x-2 mb-2 font-medium">
                            {getValidationIcon(validationStatus)}
                            <span className="text-sm">{fieldLabel}</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-background/50 border border-border/10">{validationStatus}</span>
                          </div>
                          <p className="text-sm opacity-95">{validationMessage}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {results.filledForm.suggestions && results.filledForm.suggestions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI Suggestions</h4>
                  <div className="space-y-2 bg-secondary/15 p-4 rounded-xl border border-border/30">
                    {results.filledForm.suggestions.map((suggestion: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground/90">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Form */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Drafted Form Preview</h4>
                <div className="prose max-w-none text-sm text-foreground leading-relaxed bg-secondary/30 p-4 rounded-xl border border-border/30 whitespace-pre-wrap">
                  <div dangerouslySetInnerHTML={{ __html: results.filledForm.completedForm.replace(/\n/g, '<br/>') }} />
                </div>
              </div>

              {/* Citations */}
              {results.filledForm.citations && results.filledForm.citations.length > 0 && (
                <div className="pt-4 border-t border-border/30">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Legal References</h4>
                  <div className="space-y-1.5">
                    {results.filledForm.citations.map((citation: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2 text-xs text-muted-foreground">
                        <span>•</span>
                        <span>{citation}</span>
                      </div>
                    ))}
                  </div>
                </div>
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

      </div>

    </div>

  );

};



export default FormAssistance;

