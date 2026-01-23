import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";

interface Props {
  onSuccess: (address: string) => void;
}

const UpdateAddressCard = ({ onSuccess }: Props) => {
  const [address, setAddress] = useState("");

  const updateAddressMutation = useMutation({
    mutationFn: async (address: string) => {
      const res = await api.put("/users/profile", { address });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Address updated successfully");
      onSuccess(address);
    },
    onError: () => {
      toast.error("Failed to update address");
    },
  });

  return (
    <Card className="w-full max-w-lg mx-auto p-2 md:p-4">
      <CardHeader>
        <CardTitle>Update Delivery Address</CardTitle>
        <CardDescription>
          Please add your delivery address to continue checkout
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Textarea
          placeholder="Enter your delivery address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <Button
          className="w-full"
          onClick={() => updateAddressMutation.mutate(address)}
          disabled={!address || updateAddressMutation.isPending}
        >
          {updateAddressMutation.isPending ? "Saving..." : "Save Address"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default UpdateAddressCard;
