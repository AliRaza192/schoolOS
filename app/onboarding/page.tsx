"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Building2, MapPin, Phone, Mail, Loader2, GraduationCap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const PAKISTANI_CITIES = [
  "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad",
  "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala",
  "Hyderabad", "Abbottabad", "Bahawalpur", "Sargodha", "Other",
];

const onboardingSchema = z.object({
  schoolName: z.string().min(3, "School name must be at least 3 characters").max(255),
  city: z.string().min(1, "Please select a city"),
  address: z.string().min(5, "Please enter a valid address"),
  phone: z.string().regex(/^03[0-9]{9}$/, "Please enter a valid Pakistani phone number (03XXXXXXXXX)"),
  email: z.string().email("Please enter a valid email address"),
});

type OnboardingForm = z.infer<typeof onboardingSchema>;
type AccountType = "admin" | "parent" | null;

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      schoolName: "",
      city: "",
      address: "",
      phone: "",
      email: user?.emailAddresses?.[0]?.emailAddress ?? "",
    },
  });

  // Parent onboarding
  async function handleParentOnboarding() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/onboarding/parent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user?.fullName ?? user?.firstName ?? "Parent",
          email: user?.emailAddresses?.[0]?.emailAddress ?? "",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error");

      toast.success("Parent account ready!");
      router.push("/parent");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error");
    } finally {
      setIsLoading(false);
    }
  }

  // Admin onboarding
  async function onSubmit(values: OnboardingForm) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Something went wrong");

      toast.success("School setup complete! Welcome to SchoolOS.");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  // Step 1 — Account Type Selection
  if (!accountType) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">SchoolOS Pakistan</h1>
            <p className="text-gray-500 mt-2">Aap kaun hain?</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setAccountType("admin")}
              className={cn(
                "bg-white border-2 border-gray-200 rounded-xl p-6 text-left transition-all hover:border-blue-400 hover:shadow-sm"
              )}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">
                Main school admin / teacher hun
              </h3>
              <p className="text-sm text-gray-400">
                Apna school setup karo aur students manage karo
              </p>
            </button>

            <button
              onClick={() => setAccountType("parent")}
              className={cn(
                "bg-white border-2 border-gray-200 rounded-xl p-6 text-left transition-all hover:border-green-400 hover:shadow-sm"
              )}
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Main parent hun</h3>
              <p className="text-sm text-gray-400">
                Apne bachay ki progress track karo
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2a — Parent Flow
  if (accountType === "parent") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle>Parent Account</CardTitle>
              <CardDescription>
                Account ready ho jayega. School admin se link request karo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
                <p className="font-medium mb-1">Next Steps:</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-600">
                  <li>Apne bachay ke school admin ko batao</li>
                  <li>Admin aapka email use kar ke link karega</li>
                  <li>Link hone ke baad bachay ka data dikhe ga</li>
                </ol>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setAccountType(null)}
                  className="flex-1"
                >
                  ← Back
                </Button>
                <Button
                  onClick={handleParentOnboarding}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setup ho raha hai...
                    </>
                  ) : (
                    "Continue →"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Step 2b — Admin/School Flow
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Setup Your School</h1>
          <p className="text-gray-500 mt-2">
            Welcome {user?.firstName}! Let&apos;s get your school set up.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>School Information</CardTitle>
            <CardDescription>
              This information will appear on fee receipts and reports.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="schoolName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School / Academy Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          <Input placeholder="e.g. Al-Noor Academy" className="pl-9" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your city" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PAKISTANI_CITIES.map((city) => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          <Input placeholder="e.g. Block 5, Gulshan-e-Iqbal" className="pl-9" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          <Input placeholder="03001234567" className="pl-9" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          <Input placeholder="school@example.com" className="pl-9" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAccountType(null)}
                    className="flex-1"
                  >
                    ← Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      "Complete Setup →"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}