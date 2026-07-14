import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/hooks/useUsers'
import { RequestTable } from '@/interfaces/requests.interface'

function RequestorCell({ request }: { request: RequestTable }) {
    const { data } = useUser(request.user_id);
    if (!data) return <>Loading...</>;

    return (
        <div className='flex items-center capitalize gap-2 text-xs'>
            <Avatar className='size-8'>
                <AvatarImage src={`${import.meta.env.VITE_SERVER}images/${data.image}`} />
                <AvatarFallback className='uppercase text-xs font-semibold'>
                    {`${data.first_name.charAt(0)}${data.last_name.charAt(0)}`}
                </AvatarFallback>
            </Avatar>
            <div>
                <p className='leading-tight'>{request.user}</p>
                <p className='text-zinc-500'>{data.sales_unit?.unit_name}</p>
            </div>
        </div>
    )
}

export default RequestorCell