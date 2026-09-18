import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useManageRequest, useSingleRequest } from "@/hooks/useRequests";
import { useUser } from "@/hooks/useUsers";
import { approvalStep, Approver, CartDetails, Request } from "@/interfaces/requests.interface";
import { formatAmount } from "@/lib/format";
import { cn } from "@/lib/utils";
import { addHours, format, formatDistanceToNow } from "date-fns";
import { BriefcaseBusiness, Check, FileSignature, Package, RefreshCw, X } from "lucide-react";
import { Link, useParams } from "react-router-dom"
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AvatarImage } from "@radix-ui/react-avatar";
import { useAuth } from "@/providers/auth.provider";
import ApprovalStatus, { approvalStatus } from "@/components/approval-status";
import { v4 } from "uuid";
import UserAvatar from "@/components/ui/user-avatar";
import { ConformeLEDDetails } from "./view.led";
import { ConformeSiteDetails } from "./view.site";
import { ConformeRatesTotal } from "./view.totals";

function ViewConforme() {
    const { user: currentUser } = useAuth();
    const params = useParams();
    const { data, isLoading } = useSingleRequest(params.request_no);
    const { mutate: updateApproverStatus } = useManageRequest();
    const { data: user } = useUser(data?.user_id);

    const [remarks, setRemarks] = useState("");

    const currentLevel = useMemo(() => {
        if (!data || isLoading) return 1;

        const approvers = data.approvers.filter(approver => approver.status === 3);

        if (approvers.length === 0) return 1;

        return approvers
            .reduce((min, item) => Math.min(min, item.level), approvers[0].level);


    }, [data, isLoading])

    const isCurrentApprover = useMemo(() => {
        if (!data || !currentUser || isLoading) return false;

        if (!data.approvers.length) return false;

        const approvers = data.approvers;


        const currentLevel = approvers.reduce((min, item) => Math.min(min, item.level), approvers[0].level);

        if (approvers.some(approver => approver.status === 2)) {
            return false;
        }
        const isPendingApproval = approvers.filter(approver => approver.level === currentLevel && approver.status === 3);

        return isPendingApproval.find(approver => approver.user_id === currentUser.ID)

    }, [data, isLoading, currentUser]);

    const isDone = useMemo(() => {
        if (!data || isLoading) return false;

        return data.approvers.every(approver => approver.status === 1);
    }, [data, isLoading])


    const hasRejected = useMemo(() => {
        if (!data || isLoading) return false;

        return data.approvers.some(approver => approver.status === 2);
    }, [data, isLoading])

    const onApproverOptionClick = (status: number) => {
        if (!currentUser || !params.request_no || !data) return;
        const approver = data.approvers.find(app => app.user_id === Number(currentUser.ID));
        const approverData = {
            ID: approver!.ID,
            status: status,
            remarks: remarks,
            request_no: params.request_no
        }
        updateApproverStatus(approverData)
    }
    if (!data && isLoading) {
        return <>Loading...</>
    }

    if (!data) {
        return <div className="p-4 text-center">
            Sorry, we couldn't locate your approval request. It might be deleted. Please contact the developer.
        </div>
    }


    return (
        <>
            <div className="space-y-2 print:hidden">
                <header className="flex flex-col lg:flex-row gap-4 items-start justify-between sticky top-0 bg-white p-4 border-b shadow-sm z-[5]">
                    <div className="grid gap-1">
                        <div className="flex gap-2 items-center">
                            <h1 className="font-semibold">Req. No: {data.request_no}</h1>
                            <Badge className={cn("rounded-full", isDone ? "bg-emerald-100 text-emerald-500 border-emerald-400 hover:bg-emerald-100" :
                                hasRejected ? "bg-red-200 text-red-700 border-red-700 hover:bg-red-100" : "bg-yellow-100 text-yellow-700 border-yellow-700 hover:bg-yellow-100")}>{isDone ? "Approved" : hasRejected ? "Rejected" : "Pending Approval"}</Badge>
                        </div>
                        <div className="flex items-center text-xs gap-2">
                            <div>
                                <UserAvatar className='size-8' image={user?.image ?? ""} fallback={`${user?.first_name.charAt(0)}${user?.last_name.charAt(0)}`} sales_unit={user?.sales_unit?.unit_name ?? ""} />

                            </div>
                            <p className="capitalize">{`${user?.first_name} ${user?.last_name}`}</p>
                            <span>|</span>
                            <p>{format(addHours(data.created_at, Number(import.meta.env.VITE_TIME_ADJUST) + 7), "PPPp")}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 w-full lg:flex lg:w-fit">
                        {currentUser?.ID === user?.ID &&
                            <>
                                <Button className=" group col-[1/3]" variant="outline" asChild>
                                    <Link to={`../create?token=${v4()}&no=${params.request_no}`}>
                                        <RefreshCw className="group-hover:animate-spin" />
                                        Create New
                                    </Link>
                                </Button>
                                {/* {data.status === 1 &&
                                    <Button variant="outline" className="text-emerald-600 border-emerald-600 bg-emerald-50" asChild>
                                        <Link to={`../${params.request_no}/generate`}>
                                            <PencilRuler />
                                            Generate Conforme
                                        </Link>
                                    </Button>} */}
                            </>
                        }
                        {isCurrentApprover &&
                            <>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button className="border-emerald-400 text-emerald-700 hover:bg-emerald-100" variant="outline">
                                            <Check />
                                            Approve
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="flex flex-col gap-4" align="end">
                                        <Label>Approve Request?</Label>
                                        <Textarea placeholder="Enter your comments here" className="resize-none" tabIndex={-1} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                                        <footer className="flex items-center justify-end gap-2">
                                            <Button variant="ghost">
                                                Cancel
                                            </Button>
                                            <Button className="border-emerald-400 text-emerald-700 hover:bg-emerald-100" variant="outline" onClick={() => onApproverOptionClick(1)}>
                                                <Check />
                                                Proceed
                                            </Button>
                                        </footer>
                                    </PopoverContent>
                                </Popover>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button className="border-red-400 text-red-700 hover:bg-red-200" variant="outline">
                                            <X />
                                            Reject
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="flex flex-col gap-4" align="end">
                                        <Label>Reject Request?</Label>
                                        <Textarea placeholder="Enter your comments here" className="resize-none" tabIndex={-1} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                                        <footer className="flex items-center justify-end gap-2">
                                            <Button variant="ghost">
                                                Cancel
                                            </Button>
                                            <Button className="border-red-400 text-red-700 hover:bg-red-200" variant="outline" onClick={() => onApproverOptionClick(2)}>
                                                <X />
                                                Proceed
                                            </Button>
                                        </footer>
                                    </PopoverContent>
                                </Popover>
                            </>}
                    </div>
                </header>
                <main className="p-4 py-2 grid gap-4 lg:grid-cols-2">
                    <ConformeDetails data={data} />
                    <div className="lg:sticky lg:top-28 lg:self-start">
                        <ConformeApprovers approvers={data.approvers} currentLevel={currentLevel} isDone={isDone} hasRejected={hasRejected} />
                    </div>
                </main>
            </div>
        </>
    )
}

const ConformeDetails = ({ data }: { data: Request }) => {
    const details = JSON.parse(data.details) as CartDetails;
    return <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 font-semibold">
                <BriefcaseBusiness />
                <p className="leading-[1]">{details.client_name}</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
                <Package />
                <p className="leading-[1]">{details.brand || "---"}</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
                <FileSignature />
                <p className="leading-[1]">{details.special_term || "---"}</p>
            </div>
        </div>
        <hr className="hidden lg:block" />
        <div className="w-full flex flex-col gap-2">
            {details.sites.map(site => {
                return <ConformeSiteDetails cartSite={site} key={site.ID} />
            })}
            {details.leds.map(led => {
                return <ConformeLEDDetails cartLED={led} key={led.ID} />
            })}
            <div className='flex flex-col gap-2 pt-1'>
                {details.add_ons?.length > 0 &&
                    <>
                        <div className="px-1">
                            <h3 className="font-semibold">Add Ons</h3>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            {details.add_ons.map((item, index) => {
                                return <div key={index} className="border p-4 rounded-lg flex gap-8 text-sm sm:max-w-sm justify-between">
                                    <div>
                                        <div className="flex items-center gap-1 font-semibold">
                                            <p>{item.qty}x</p>
                                            <p>{item.name}</p>
                                        </div>
                                        <p className="pl-4 text-xs">{formatAmount(item.value)}</p>
                                    </div>
                                    <p className="font-semibold">{formatAmount(item.total)}</p>
                                </div>
                            })}
                        </div>
                    </>
                }
            </div>
            <ConformeRatesTotal details={details} />
        </div>
    </section>
}

const ConformeApprovers = ({ approvers, currentLevel, isDone, hasRejected }: { approvers: Approver[]; currentLevel: number; isDone: boolean; hasRejected: boolean }) => {

    const approverByLevel = useMemo(() => {
        const groups = approvers.reduce((acc, item) => {
            const level = Number(item.level);
            if (!acc[level]) {
                acc[level] = [];
            }
            acc[level].push(item)

            return acc;
        }, {} as Record<number, Approver[]>)

        return Object.values(groups).map(group =>
            [...group].sort((a, b) => {
                // Ascending
                return a.status - b.status;

            })
        );
    }, [approvers]);


    return <section className="space-y-4">
        <Label>Approval Record</Label>
        <div className="flex flex-col gap-2">
            {approverByLevel.map((approverGroup, index) => {
                const isCurrentLevel = currentLevel - 1 === index;
                const isApproved = approverGroup.every(approver => approver.status === 1);
                const isGroupRejected = approverGroup.some(approver => approver.status === 2);
                return <section key={index} className="space-y-2 relative">
                    <header className="relative flex items-center gap-6 z-[4]">
                        <div className={cn("size-[25px] flex items-center justify-center rounded-full text-xs font-semibold bg-zinc-300 text-zinc-200",
                            isCurrentLevel || isApproved ? "bg-emerald-200 text-emerald-600" :
                                isCurrentLevel || isGroupRejected ? "bg-zinc-300 text-zinc-200" : "",
                            isGroupRejected ? "bg-red-200 text-red-600" : "",
                        )}>{isApproved ? <Check size={14} /> : isGroupRejected ? <X size={14} /> : <p>{index + 1}</p>}</div>
                        <Label>{approvalStep[approverGroup[0].position]}</Label>
                    </header>
                    <main className="pl-12 flex flex-col gap-4">
                        {approverGroup.map(approver => {
                            return <ApproverItem key={approver.ID} approver={approver} isCurrentLevel={isCurrentLevel} isRejected={hasRejected} />
                        })}
                    </main>
                    <div className={cn("absolute w-[6px] h-[115%] top-0 left-[9.5px] z-[3] bg-zinc-300 rounded-full", isApproved ? "bg-emerald-200" : "",
                        isGroupRejected ? "bg-red-300 text-red-200" : "",)} />
                </section>
            })}
            <section className="pt-2">
                <header className="relative flex items-center gap-6 z-[4]">
                    <div className={cn("size-[25px] flex items-center justify-center rounded-full text-xs font-semibold bg-zinc-300 text-zinc-100",
                        isDone ? "bg-emerald-200 text-emerald-600" : "")}>
                        <Check size={14} />
                    </div>
                    <Label>Done</Label>
                </header>
            </section>
        </div>
    </section>
}

const ApproverItem = ({ approver, isCurrentLevel, isRejected }: { approver: Approver; isCurrentLevel: boolean; isRejected: boolean }) => {
    const { data, isLoading } = useUser(approver.user_id);

    const status = approvalStatus[approver.status as keyof typeof approvalStatus];

    if (!data || isLoading) return <>Loading...</>

    return <div className="grid grid-cols-2 md:grid-cols-4 items-start sm:items-center gap-4">
        <div className="flex items-start sm:items-center gap-2">
            <Avatar className="size-8">
                <AvatarImage src={`${import.meta.env.VITE_SERVER}images/${data.image}`} className="w-full object-cover object-top" />
                <div className={cn("absolute bottom-0 right-0 rounded-full size-3 bg-emerald-100 md:hidden", status.className)} />
                <AvatarFallback className="text-xs font-semibold uppercase">{`${data.first_name.charAt(0)}${data.last_name.charAt(0)}`}</AvatarFallback>
            </Avatar>
            <div>
                <p className="capitalize text-xs whitespace-nowrap md:text-sm">{`${data.first_name} ${data.last_name}`}</p>
                <p className={cn("capitalize text-xs !bg-transparent md:hidden", status.className)}>{status.label}</p>
            </div>
        </div>
        <div className="hidden md:block md:text-center">
            <ApprovalStatus status={approver.status} />
        </div>
        {approver.remarks &&
            <Textarea disabled className="resize-none disabled:shadow-none border-zinc-400 disabled:opacity-100 col-[1/3] sm:col-[2/3] md:col-[3/4]" value={approver.remarks} />
        }
        <div className="flex flex-col text-xs gap-0.5 row-[1/2] col-[2/3] sm:col-[3/4] md:col-[4/5] items-end">
            {(isCurrentLevel && approver.status === 3 && !isRejected) &&
                <Badge className="w-fit font-normal px-1.5 text-[0.65rem]" variant="secondary">{`Waited for ${formatDistanceToNow(addHours(approver.modified_at, Number(import.meta.env.VITE_TIME_ADJUST) + 7))}`}</Badge>
            }
            {approver.status !== 3 ? <>
                <p>{format(addHours(approver.modified_at, Number(import.meta.env.VITE_TIME_ADJUST) + 7), "PP")}</p>
                <p>{format(addHours(approver.modified_at, Number(import.meta.env.VITE_TIME_ADJUST) + 7), "p")}</p>
            </> : (!isCurrentLevel || isRejected) && <p>---</p>}
        </div>
    </div>
}
export default ViewConforme