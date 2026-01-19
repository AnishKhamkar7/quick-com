import { useState } from "react";
import { User, Mail, Phone, MapPin, Pencil, Save } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// Mocked data (replace with API data later)
const initialProfile = {
  name: "Anish Khamkar",
  email: "anish@example.com",
  phone: "9876543210",
  address: "Flat 302, MG Road, Pune, Maharashtra",
};

const CustomerProfile = () => {
  const [profile, setProfile] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // 🔥 Call update profile API here
    console.log("Updated profile:", profile);
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information
          </p>
        </div>

        <Button
          variant={isEditing ? "default" : "outline"}
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className="gap-2"
        >
          {isEditing ? (
            <Save className="w-4 h-4" />
          ) : (
            <Pencil className="w-4 h-4" />
          )}
          {isEditing ? "Save Changes" : "Edit Profile"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Basic Information
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                name="name"
                value={profile.name}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  name="email"
                  value={profile.email}
                  disabled
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Phone</Label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="pl-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Delivery Address
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                name="address"
                value={profile.address}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <Separator />

            <p className="text-sm text-muted-foreground">
              This address will be used as default delivery location
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerProfile;
