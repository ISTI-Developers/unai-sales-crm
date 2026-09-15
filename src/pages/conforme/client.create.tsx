import ClientBrandCombobox from '@/components/ui/client-brand-combo-box'
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'
import { Cart } from '@/interfaces/requests.interface';
import SkeletonLoader from '@/misc/SkeletonLoader';
import { Dispatch, SetStateAction } from 'react';

interface ClientContainerProps {
    cart: Cart;
    setCart: Dispatch<SetStateAction<Cart>>;
    isLoading: boolean
}

function ClientContainer({ cart, setCart, isLoading }: ClientContainerProps) {
    // const [isExpanded, setIsExpanded] = useState(true)
    return (
        <section className='border rounded-xl flex flex-col gap-4'>
            <div className='flex items-center justify-between p-3 border-b'>
                <div>
                    <Label className='font-bold'>Client Details</Label>
                </div>
            </div>
            <div className='p-4 flex flex-col gap-4 pt-0'>
                <div className='grid grid-cols-[auto_1fr] gap-4 items-center'>
                    <Label>Name</Label>
                    <SkeletonLoader isLoading={isLoading} className='w-full h-9'>
                        <ClientBrandCombobox value={cart.client} onValueChange={(value) => setCart(prev => ({
                            ...prev,
                            client: value,
                            brand: value?.brand ?? "",
                        }))} />
                    </SkeletonLoader>
                </div>
                <div className='grid grid-cols-[auto_1fr] gap-4 items-center'>
                    <Label>Brand</Label>
                    <SkeletonLoader isLoading={isLoading} className='w-full h-9'>
                        <Input value={cart.brand} onChange={(e) => setCart(prev => ({
                            ...prev,
                            brand: e.target.value
                        }))} />
                    </SkeletonLoader>
                </div>
            </div>
        </section>
    )
}

export default ClientContainer