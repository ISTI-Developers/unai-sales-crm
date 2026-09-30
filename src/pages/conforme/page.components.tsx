import { appliesToPayment, PaymentRule, PaymentTiming } from "@/interfaces/requests.interface"
import { cn, ordinal } from "@/lib/utils"
import { ReactNode } from "react"

export const Header = ({ title }: { title: string }) => <header data-page-block="header" className='font-semibold uppercase border-b border-b-[#000]'>
    {title}
</header>

export const ListBlock = ({ children, className }: { children: ReactNode; className?: string; }) => (
    <li data-page-block className={cn("leading-tight ml-6 text-justify", className)} >
        {children}
    </li>
);
export const BillingPeriod = (term: PaymentTiming) => {
    return <ListBlock className="ml-12">{`Monthly payment will start on the ${ordinal(term.startDate)} day upon installation/commencement of the billboard via ${term.payment_method === "PDC" ? "post-dated cheques" : "bank transfer"}.`}</ListBlock>
}

export const MonthlyContractTerm = ({ rules }: { rules: Record<number, PaymentRule[]> }) => {

    const monthRules = Object.entries(rules).map(([month, rule]) => {
        const baseRule = [`For ${month}-month contract: `];

        rule.forEach(item => {
            if (item.type === "ADVANCE") {
                baseRule.push(`${item.months} month${item.months > 1 ? "s" : ""} advance payment applicable to the ${appliesToPayment[item.applies_to]} ${item.months !== 1 ? item.months : ""} month${item.months > 1 ? "s" : ""}  of the contract${rule.some(r => r.type === "DEPOSIT") ? " and " : "."}`);
            }
            if (item.type === "DEPOSIT") {
                baseRule.push(`${item.months} month${item.months > 1 ? "s" : ""} deposit applicable to the ${appliesToPayment[item.applies_to]} ${item.months !== 1 ? item.months : ""} month${item.months > 1 ? "s" : ""}  of the contract.`);
            }

        })
        baseRule.push(' Remaining balances will be paid on a monthly basis.');

        return baseRule;
    })
    return monthRules.flatMap(rule => {
        return <ListBlock className="ml-12">{rule}</ListBlock>
    })
}