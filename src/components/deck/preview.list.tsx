import { useDeck } from '@/providers/deck.provider';
import PreviewItem from './preview.item';

const PreviewsList = () => {
    const { selectedSites } = useDeck();
    return (
        <>
            {selectedSites.map((item) => (
                <PreviewItem key={item.ID} item={item} />
            ))}
        </>
    )
}

export default PreviewsList