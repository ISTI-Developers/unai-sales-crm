import { ClientMedium } from '@/interfaces/client.interface';
import { Badge } from './ui/badge';

const Mediums = ({ mediums }: { mediums: ClientMedium[] }) => {
    return (
        <div className="flex flex-wrap gap-1.5">
            {mediums.length > 0 ? mediums.map((medium) => {
                return (
                    <Badge key={medium.cm_id} variant="outline" className='bg-white'>{medium.name}</Badge>
                );
            }) : '---'}
        </div>
    );
}

export default Mediums