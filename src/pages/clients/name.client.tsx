import { Button } from '@/components/ui/button';
import { TagsMapping } from '@/data/clients.keymap';
import { useAccess } from '@/hooks/useClients';
import { ClientTable } from '@/interfaces/client.interface'
import { cn } from '@/lib/utils';
import { CellContext } from '@tanstack/react-table'
import { ListChevronsDownUp, ListChevronsUpDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ClientName({ row }: CellContext<ClientTable, unknown>) {
    const name: string = row.getValue("name");
    const { access } = useAccess("clients.editCompany");
    const last_submitted_on = row.original.last_submitted_on;
    const tags = row.original.tags;
    const tag = tags ? TagsMapping[tags as keyof typeof TagsMapping] : null;

    const padding = row.original.parent_id ? `${row.depth * 2.25}rem` : `${row.depth * 2.25}rem`
    return (
        <div className={cn("w-full max-w-[325px] flex gap-4 items-center truncate")} style={{ paddingLeft: padding }}>

            {row.getCanExpand() && (
                <Button variant="ghost" size="icon" className="size-5" onClick={row.getToggleExpandedHandler()}>
                    {row.getIsExpanded() ? <ListChevronsDownUp /> : <ListChevronsUpDown />}
                </Button>
            )}
            <div className="grid gap-1">
                <div className={cn("text-xs uppercase flex items-center gap-2")}>
                    {tag && <div title={tag.label}>
                        <tag.icon size={14} className={cn(tag.className, "shrink-0")} />
                    </div>}
                    <Link to={`./${(name).replace(/ /g, "_").replace(/\//g, "-")}`} title={name} onClick={() => localStorage.setItem("client", String(row.original.client_id))} className="font-semibold leading-none hover:underline truncate">{name}</Link>
                    {(row.original.children &&
                        row.original.children.length > 0) &&
                        <p className="text-[0.65rem] bg-emerald-400 w-4 h-4 flex items-center justify-center rounded text-white font-semibold">{row.original.children.length}</p>}
                </div>
                {access &&
                    <p className="text-[0.65rem] leading-tight italic text-neutral-400">
                        {last_submitted_on !== null ?
                            `${last_submitted_on} days since last activity` :
                            `No activities found`
                        }
                    </p>
                }
            </div>
        </div>
    );
}
