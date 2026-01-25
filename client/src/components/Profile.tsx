import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Pencil,
  Save,
  Truck,
  Building2,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type User as UserType } from "@/providers/AuthProvider";

interface ProfileComponentProps {
  user: UserType;
}

const VEHICLE_TYPES = ["Bike", "Scooter", "Bicycle", "Car"];

const ProfileComponent = ({ user }: ProfileComponentProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const [profile, setProfile] = useState(() => {
    if (user.role === "CUSTOMER") {
      return {
        phone: user?.phone || "",
        address: user?.customer?.address || "",
      };
    } else if (user.role === "DELIVERY_PARTNER") {
      return {
        phone: user?.phone || "",
        vehicleType: user?.deliveryPartner?.vehicleType || "",
      };
    } else {
      // ADMIN
      return {
        phone: user?.phone || "",
      };
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const payload: {
        phone?: string;
        address?: string;
        vehicleType?: string;
      } = {};

      if (profile.phone !== user.phone) {
        payload.phone = profile.phone;
      }

      if (user.role === "CUSTOMER") {
        const customerProfile = profile as { phone: string; address: string };
        if (customerProfile.address !== user.customer?.address) {
          payload.address = customerProfile.address;
        }
      } else if (user.role === "DELIVERY_PARTNER") {
        const partnerProfile = profile as {
          phone: string;
          vehicleType: string;
        };
        if (partnerProfile.vehicleType !== user.deliveryPartner?.vehicleType) {
          payload.vehicleType = partnerProfile.vehicleType;
        }
      }

      const res = await api.put("/users/profile", payload);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["auth", "profile"] });
      setIsEditing(false);
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate();
  };

  const handleEditToggle = () => {
    if (!isEditing && user) {
      if (user.role === "CUSTOMER") {
        setProfile({
          phone: user.phone || "",
          address: user.customer?.address || "",
        });
      } else if (user.role === "DELIVERY_PARTNER") {
        setProfile({
          phone: user.phone || "",
          vehicleType: user.deliveryPartner?.vehicleType || "",
        });
      } else {
        setProfile({
          phone: user.phone || "",
        });
      }
    }

    setIsEditing((prev) => !prev);
  };

  const getProfileTitle = () => {
    switch (user.role) {
      case "CUSTOMER":
        return "Customer Profile";
      case "DELIVERY_PARTNER":
        return "Delivery Partner Profile";
      case "ADMIN":
        return "Admin Profile";
      default:
        return "My Profile";
    }
  };

  return (
    <div className="container mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            {getProfileTitle()}
          </h2>
          <p className="text-muted-foreground">
            Manage your personal information
          </p>
        </div>

        <Button
          variant={isEditing ? "default" : "outline"}
          onClick={() => (isEditing ? handleSave() : handleEditToggle())}
          className="gap-2"
          disabled={updateProfileMutation.isPending}
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
              <Input value={user?.name || ""} disabled />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input value={user?.email || ""} disabled className="pl-9" />
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

            <div className="space-y-2">
              <Label>Role</Label>
              <Input
                value={user?.role.replace("_", " ")}
                disabled
                className="capitalize"
              />
            </div>
          </CardContent>
        </Card>

        {/* Role-specific Information */}
        {user.role === "CUSTOMER" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Delivery Information
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={user?.customer?.city || ""} disabled />
              </div>

              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  name="address"
                  value={
                    (profile as { phone: string; address: string }).address
                  }
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <Separator />

              <p className="text-sm text-muted-foreground">
                This address will be used as default delivery location. City
                cannot be changed.
              </p>
            </CardContent>
          </Card>
        )}

        {user.role === "DELIVERY_PARTNER" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Delivery Partner Information
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={user?.deliveryPartner?.city || ""} disabled />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Input
                  value={user?.deliveryPartner?.status || ""}
                  disabled
                  className="capitalize"
                />
              </div>

              <div className="space-y-2">
                <Label>Vehicle Type</Label>
                <Select
                  value={
                    (profile as { phone: string; vehicleType: string })
                      .vehicleType
                  }
                  onValueChange={(value) =>
                    handleSelectChange("vehicleType", value)
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_TYPES.map((vehicle) => (
                      <SelectItem key={vehicle} value={vehicle}>
                        {vehicle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <p className="text-sm text-muted-foreground">
                Update your vehicle information. City and status are managed by
                the system.
              </p>
            </CardContent>
          </Card>
        )}

        {user.role === "ADMIN" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Admin Information
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Administrator Privileges</Label>
                <p className="text-sm text-muted-foreground">
                  You have full access to manage the platform, including users,
                  orders, products, and delivery partners.
                </p>
              </div>

              <Separator />

              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Manage all users and roles</p>
                <p>• View and manage all orders</p>
                <p>• Control product inventory</p>
                <p>• Monitor delivery partners</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProfileComponent;
