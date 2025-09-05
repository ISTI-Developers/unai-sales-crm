import BasicSection from "@/components/sites/basic.section";
import ImagesSection from "@/components/sites/images.section";
import LocationSection from "@/components/sites/location.section";
import { Button } from "@/components/ui/button";
import { useSite, useSiteImages } from "@/hooks/useSites";
import Page from "@/misc/Page";
import { ChevronLeft } from "lucide-react";
import { useMemo } from "react";
import { Helmet } from "react-helmet";
import { Link, Navigate, useParams } from "react-router-dom";

const ViewSite = () => {
  const { id } = useParams();
  const { data, isLoading: areInfoLoading } = useSite(id);
  const { data: images, isLoading: areImagesLoading } = useSiteImages(id);

  const isLoading = useMemo(() => {
    return areImagesLoading && areInfoLoading;
  }, [areImagesLoading, areInfoLoading]);
  if (!id) {
    return <Navigate to="/sites" />;
  }
  return (
    <Page className="flex flex-col gap-4">
      <Helmet>
        <title>{id} | Sites</title>
      </Helmet>
      <header className="flex items-center justify-between border-b pb-1.5">
        <h1 className="text-blue-500 font-bold uppercase">{id}</h1>
        <Button variant="link" type="button" asChild>
          <Link to="/sites">
            <ChevronLeft /> Back
          </Link>
        </Button>
      </header>
      <main className="grid gap-4">
        {isLoading ? (
          "Retrieving data..."
        ) : (
          <>
            <BasicSection data={data} />
            <LocationSection data={data} />
            <ImagesSection data={images} />
          </>
        )}
      </main>
    </Page>
  );
};

export default ViewSite;
