import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";

import { Card } from "@/components/ui/card";

import { Switch } from "@/components/ui/switch";

import { Slider } from "@/components/ui/slider";

import { 

  Shield, 

  Eye, 

  Trash2, 

  Settings,

  CheckCircle,

  AlertTriangle,

  Info,

  Loader2

} from "lucide-react";

import { apiClient } from "@/services/api";

import { toast } from "sonner";



const PrivacySettings = () => {

  const [anonymizeQueries, setAnonymizeQueries] = useState(false);

  const [dataRetentionDays, setDataRetentionDays] = useState(30);

  const [isLoading, setIsLoading] = useState(false);

  const [isSaving, setIsSaving] = useState(false);



  useEffect(() => {

    loadPrivacySettings();

  }, []);



  const loadPrivacySettings = async () => {

    setIsLoading(true);

    try {

      // In a real app, this would load from user profile

      // For now, we'll use default values

      setAnonymizeQueries(false);

      setDataRetentionDays(30);

    } catch (error) {

      console.error('Failed to load privacy settings:', error);

      toast.error('Failed to load privacy settings');

    } finally {

      setIsLoading(false);

    }

  };



  const handleSaveSettings = async () => {

    setIsSaving(true);

    try {

      const userId = localStorage.getItem('userId') || 'anonymous';

      const response = await apiClient.updatePrivacy(userId, {

        anonymizeQueries,

        dataRetentionDays

      });



      if (response.success) {

        toast.success('Privacy settings updated successfully!');

      }

    } catch (error) {

      console.error('Failed to save privacy settings:', error);

      toast.error('Failed to save privacy settings');

    } finally {

      setIsSaving(false);

    }

  };



  const handleAnonymizeToggle = (checked: boolean) => {

    setAnonymizeQueries(checked);

    if (checked) {

      toast.info('Query anonymization enabled. Your personal information will be removed before AI processing.');

    }

  };



  const handleRetentionChange = (value: number[]) => {

    setDataRetentionDays(value[0]);

  };



  if (isLoading) {

    return (

      <div className="flex items-center justify-center py-12">

        <div className="text-center">

          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />

          <p className="text-muted-foreground">Loading privacy settings...</p>

        </div>

      </div>

    );

  }



  return (

    <section id="privacy" className="py-20 bg-secondary/30">

      <div className="container mx-auto px-4">

        <div className="text-center mb-16 animate-fade-up">

          <h2 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-4">

            Privacy & Security

          </h2>

          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">

            Take control of your data privacy and security. Configure how your information 

            is processed, stored, and protected.

          </p>

        </div>



        <div className="max-w-4xl mx-auto space-y-8">

          {/* Anonymize Query Toggle (Feature #21) */}

          <Card className="p-8 gradient-card border-border/50">

            <div className="space-y-6">

              <div className="flex items-center space-x-3">

                <div className="p-2 rounded-lg bg-blue-500/10">

                  <Eye className="h-6 w-6 text-blue-500" />

                </div>

                <div>

                  <h3 className="text-xl font-heading font-semibold text-primary">

                    Anonymize Query Toggle

                  </h3>

                  <p className="text-sm text-muted-foreground">

                    Remove personal information from queries before AI processing

                  </p>

                </div>

              </div>



              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">

                <div className="space-y-1">

                  <p className="font-medium text-primary">Enable Query Anonymization</p>

                  <p className="text-sm text-muted-foreground">

                    If enabled, the system uses the Encryption Module to perform pre-processing 

                    anonymization, removing PII from user queries before they are processed by 

                    the generative AI model.

                  </p>

                </div>

                <Switch

                  checked={anonymizeQueries}

                  onCheckedChange={handleAnonymizeToggle}

                />

              </div>



              {anonymizeQueries && (

                <div className="flex items-center space-x-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">

                  <CheckCircle className="h-4 w-4 text-green-500" />

                  <p className="text-sm text-green-700">

                    Query anonymization is active. Your personal information will be protected.

                  </p>

                </div>

              )}

            </div>

          </Card>



          {/* Data Retention Control (Feature #22) */}

          <Card className="p-8 gradient-card border-border/50">

            <div className="space-y-6">

              <div className="flex items-center space-x-3">

                <div className="p-2 rounded-lg bg-orange-500/10">

                  <Trash2 className="h-6 w-6 text-orange-500" />

                </div>

                <div>

                  <h3 className="text-xl font-heading font-semibold text-primary">

                    Data Retention Control

                  </h3>

                  <p className="text-sm text-muted-foreground">

                    Set automatic deletion policies for your stored data

                  </p>

                </div>

              </div>



              <div className="space-y-4">

                <div className="space-y-2">

                  <p className="font-medium text-primary">Data Retention Period</p>

                  <p className="text-sm text-muted-foreground">

                    Allowing the user to set explicit policies (e.g., auto-delete history after 30 days) 

                    for data stored in PostgreSQL and the document repository, reinforcing user control.

                  </p>

                </div>



                <div className="space-y-4">

                  <div className="flex items-center justify-between">

                    <span className="text-sm font-medium text-primary">Retention Period</span>

                    <span className="text-sm text-muted-foreground">{dataRetentionDays} days</span>

                  </div>

                  

                  <Slider

                    value={[dataRetentionDays]}

                    onValueChange={handleRetentionChange}

                    max={365}

                    min={1}

                    step={1}

                    className="w-full"

                  />

                  

                  <div className="flex justify-between text-xs text-muted-foreground">

                    <span>1 day</span>

                    <span>1 year</span>

                  </div>

                </div>



                <div className="grid grid-cols-3 gap-4 text-center">

                  <div className="p-3 rounded-lg bg-secondary/50">

                    <p className="text-sm font-medium text-primary">7 days</p>

                    <p className="text-xs text-muted-foreground">Short-term</p>

                  </div>

                  <div className="p-3 rounded-lg bg-secondary/50">

                    <p className="text-sm font-medium text-primary">30 days</p>

                    <p className="text-xs text-muted-foreground">Standard</p>

                  </div>

                  <div className="p-3 rounded-lg bg-secondary/50">

                    <p className="text-sm font-medium text-primary">90 days</p>

                    <p className="text-xs text-muted-foreground">Extended</p>

                  </div>

                </div>

              </div>

            </div>

          </Card>



          {/* Security Information */}

          <Card className="p-8 gradient-card border-border/50">

            <div className="space-y-6">

              <div className="flex items-center space-x-3">

                <div className="p-2 rounded-lg bg-green-500/10">

                  <Shield className="h-6 w-6 text-green-500" />

                </div>

                <div>

                  <h3 className="text-xl font-heading font-semibold text-primary">

                    Security Features

                  </h3>

                  <p className="text-sm text-muted-foreground">

                    Built-in security measures to protect your data

                  </p>

                </div>

              </div>



              <div className="grid md:grid-cols-2 gap-6">

                <div className="space-y-3">

                  <div className="flex items-center space-x-2">

                    <CheckCircle className="h-4 w-4 text-green-500" />

                    <span className="text-sm font-medium text-primary">End-to-End Encryption</span>

                  </div>

                  <p className="text-xs text-muted-foreground">

                    All data is encrypted in transit and at rest using industry-standard protocols.

                  </p>

                </div>



                <div className="space-y-3">

                  <div className="flex items-center space-x-2">

                    <CheckCircle className="h-4 w-4 text-green-500" />

                    <span className="text-sm font-medium text-primary">Secure Data Storage</span>

                  </div>

                  <p className="text-xs text-muted-foreground">

                    Data is stored in secure, compliant databases with regular security audits.

                  </p>

                </div>



                <div className="space-y-3">

                  <div className="flex items-center space-x-2">

                    <CheckCircle className="h-4 w-4 text-green-500" />

                    <span className="text-sm font-medium text-primary">Access Controls</span>

                  </div>

                  <p className="text-xs text-muted-foreground">

                    Role-based access control ensures only authorized personnel can access your data.

                  </p>

                </div>



                <div className="space-y-3">

                  <div className="flex items-center space-x-2">

                    <CheckCircle className="h-4 w-4 text-green-500" />

                    <span className="text-sm font-medium text-primary">Audit Logging</span>

                  </div>

                  <p className="text-xs text-muted-foreground">

                    All access and modifications are logged for security and compliance purposes.

                  </p>

                </div>

              </div>

            </div>

          </Card>



          {/* Save Settings */}

          <div className="flex justify-center">

            <Button

              onClick={handleSaveSettings}

              disabled={isSaving}

              size="lg"

              className="flex items-center space-x-2"

            >

              {isSaving ? (

                <>

                  <Loader2 className="h-4 w-4 animate-spin" />

                  <span>Saving...</span>

                </>

              ) : (

                <>

                  <Settings className="h-4 w-4" />

                  <span>Save Privacy Settings</span>

                </>

              )}

            </Button>

          </div>



          {/* Additional Info */}

          <Card className="p-6 gradient-card border-border/50">

            <div className="flex items-start space-x-3">

              <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />

              <div className="space-y-2">

                <h4 className="font-medium text-primary">Privacy Policy & Compliance</h4>

                <p className="text-sm text-muted-foreground">

                  Your privacy settings are designed to comply with international data protection 

                  regulations including GDPR, CCPA, and Indian data protection laws. Changes to 

                  these settings will be applied immediately and affect all future data processing.

                </p>

              </div>

            </div>

          </Card>

        </div>

      </div>

    </section>

  );

};



export default PrivacySettings;

