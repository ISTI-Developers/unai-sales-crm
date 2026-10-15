import { AvatarGroup } from '@/components/ui/avatar';
import UserAvatar from '@/components/ui/user-avatar';
import { useUsers } from '@/hooks/useUsers';
import { useMemo } from 'react'

function AccountExecutives({ accounts }: { accounts: string }) {
    const { data: users = [] } = useUsers();
    const strippedAE = accounts.trim();

    const avatars = useMemo(() => {
        const AEs = strippedAE.split(",");
        return users.filter(user => {
            const name = `${user.first_name} ${user.last_name}`;
            return AEs.some(ae => ae.trim().toLowerCase() === name.toLowerCase());
        })
    }, [strippedAE, users])

    if (avatars.length === 0) {
        return <>---</>
    }

    return <AvatarGroup>
        {avatars.map(avatar => {
            return <UserAvatar key={avatar.ID} tooltip={`${avatar.first_name} ${avatar.last_name}`} className='size-8 text-[0.65rem]' fallbackClassName='bg-white' fallback={`${avatar.first_name[0]}${avatar.last_name[0]}`} image={avatar.image ?? null} />
        })}
    </AvatarGroup>
}

export default AccountExecutives
