import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAccess } from '@/hooks/useClients';
import { ClientInformation } from '@/interfaces/client.interface'
import { useAuth } from '@/providers/auth.provider';
import { Briefcase, Mail, Phone, User2 } from 'lucide-react'
import { useMemo } from 'react';

function ContactsTab({ client }: { client: ClientInformation }) {
    const { user } = useAuth();
    const { access: view } = useAccess("clients.viewContactInformation");
    const { access: viewAll } = useAccess("clients.viewAll");

    const isViewable = useMemo(() => {
        if (!user) return false;

        if (client.sales_unit_id === user.sales_unit?.sales_unit_id) {
            return view;
        }
        return viewAll;
    }, [client.sales_unit_id, user, view, viewAll])

    if (!isViewable) {
        return <div className="flex shadow bg-white p-4 border rounded-xl gap-4 items-center justify-center">
            <div className="text-center text-zinc-500">
                Only the admin and the client account owner can view this contact information details.
                <br />
                Please contact them if you wish to have access.
            </div>
        </div>
    }
    return (
        <div className="flex shadow bg-white p-4 border rounded-xl gap-4">
            <Avatar>
                <AvatarFallback>
                    <User2 />
                </AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
                <span className="font-semibold">
                    {client.contact_person || "---"}
                </span>
                {client.designation &&
                    <div className="flex items-center gap-1">
                        <Briefcase size={14} />
                        <span className="text-sm">
                            {client.designation || "---"}
                        </span>
                    </div>
                }
                {client.contact_number &&
                    <div className="flex items-center gap-1">
                        <Phone size={14} />
                        <span className="text-sm">
                            {client.contact_number || "---"}
                        </span>
                    </div>
                }
                {client.email_address &&
                    <div className="flex items-center gap-1">
                        <Mail size={14} />
                        <span className="text-sm">
                            {client.email_address || "---"}
                        </span>
                    </div>
                }
            </div>
        </div>
    )
}

export default ContactsTab