import { SiteImage } from "@/interfaces/sites.interface";
import { Container } from "../container";

const ImagesSection = ({ data }: { data?: SiteImage[] }) => {
  return (
    <Container title="Site Images" className="bg-white">
      <div className="flex flex-wrap flex-1 gap-4 w-full max-h-[32.5vh] justify-center overflow-y-auto">
        {data &&
          data.map((item) => {
            const src = `${import.meta.env.VITE_UNIS_URL}${item.upload_path}`;
            return (
              <img
                key={item.upload_id}
                src={src}
                className="w-full max-w-[210px] aspect-video rounded"
                loading="lazy"
                alt={`image_${item.upload_id}`}
              />
            );
          })}
      </div>
    </Container>
  );
};

export default ImagesSection;
