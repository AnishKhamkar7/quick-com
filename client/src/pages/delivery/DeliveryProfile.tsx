import ProfileComponent from "@/components/Profile";
import { useAuth } from "@/context/auth-context";

const DeliveryProfile = () => {
  const { user } = useAuth();

  return <ProfileComponent user={user!} />;
};

export default DeliveryProfile;
