import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function AppLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <LoadingSpinner className="h-8 w-8" />
    </div>
  );
}
