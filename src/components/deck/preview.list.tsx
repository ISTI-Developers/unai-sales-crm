import { useDeck } from '@/providers/deck.provider';
import PreviewItem from './preview.item';

const PreviewsList = () => {
    const { selectedSites, selectedSite } = useDeck();
    return (
        <>
            {selectedSites.map((item, index) => (
                <PreviewItem key={item.ID} item={item} className={index === selectedSite ? "border-red-300" : ""} />
            ))}
        </>
    )
}

export default PreviewsList