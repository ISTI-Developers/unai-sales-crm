export interface TermsAndConditions {
    label?: string;
    content: string;
    value?: number;
    isBold: boolean;
    isItalic?: boolean;
    use: boolean;
}

export const termsAndConditions: TermsAndConditions[] = [
    {
        content: "The post-dated cheques must be given to United Neon Advertising Inc. upon signing of the agreement.",
        isBold: false,
        use: true,
    },
    {
        content: "No advance rental or PDC's, No installation.",
        isBold: false,
        use: true,
    },
    {
        content: "Applicable taxes on the advance payment shall be remitted to the Bureau of Internal Revenue (BIR) in accordance with applicable regulations. Once remitted, such taxes shall no longer be subject to recovery or adjustment, notwithstanding any subsequent changes to the contract.",
        isBold: false,
        isItalic: true,
        use: true
    },
    {
        label: "Witholding Tax Rate",
        content: "5% for Rental; 2% for Services such as printing, special execution, installation & dismantling, maintenance etc.",
        isBold: true,
        use: true,
    },
    {
        content: "Upon collection, Withholding Tax Certificate (BIR form 2307) should be remitted together with the monthly check payment.",
        isBold: true,
        use: true,
    },
    {
        content: "Upon signing by both parties, this agreement is deemed live & binding, denying the client at any given cause to: (1) cancel this agreement before commencing; (2) terminate this agreement prior to its full execution, without being liable to United Neon to settle the full contract amount agreed upon. ",
        isBold: false,
        use: true,
    },
    {
        content: "For Reseller/Agency clients, the client shall disclose the brand(s) represented and/or to be presented under this Agreement prior to its execution. This transparency is crucial as it ensures that both parties have a clear understanding of the obligations involved and prevents potential conflicts of interest. United Neon reserves the right to review and grant final approval or acceptance of this agreement if the brand(s) are not disclosed as required herein.",
        isBold: false,
        use: true,
    },
    {
        content: "Under no circumstances shall the commencement date be moved to the date of actual installation of client’s advertising material should the delay is caused by the client, client’s suppliers or any other parties other than United Neon & its suppliers.  Loss of time exposure of such delay would be on the expense of the client.",
        isBold: false,
        use: true,
    },
    {
        content: "Design of photographic material shall be mutually agreed upon by both parties.  United Neon has the final option to approve or disapprove the contents of the material based on existing governmental policies & company’s standard operating procedures.",
        isBold: false,
        use: true,
    },
    {
        content: "Materials produced by client should be delivered at least 5 days (GMA areas) or 8 days (Provincial areas) prior to commencement date. ",
        isBold: false,
        use: true,
    },
    {
        content: "Material for pick-up is for the account of the client at [value]",
        value: 5000,
        isBold: false,
        use: true,
    },
    {
        content: "United Neon shall provide the client Accomplishment reports within five (5) days upon installation of material.",
        isBold: false,
        use: true,
    },
    {
        content: "Client undertakes to procure the used advertising material from United Neon's warehouse within 15 days from dismantling date. Otherwise, United Neon may sell or dispose off the materials without any liability to the client.",
        isBold: false,
        use: true,
    },
    {
        content: "Neither party shall be liable to the other for damages or any delay or default in the performance of its obligations under this contract if such failure is due to force majeure and if the same is without the fault or negligence of the other party. This shall include, without limitation, any act of God, act of any government or other authority or statutory undertaking, earthquake, industrial dispute, fire, explosion, accident, power failure, flood, riot, war within the locality of the Billboard structure. All obligations of each party shall return to the status of being in full force and effect upon the termination of such occurrence; provided, however, that in the event of a force majeure lasting more than ninety (90) days, this Contract may be terminated with neither party incurring any liability whatsoever.",
        isBold: false,
        use: true,
    },
    {
        label: "ADS MAINTENANCE/DISMANTLING AND REPAIR; PULL-DOWN/PULL-UP",
        content: "Lessor shall ensure that the ad materials placed in the Billboard ad space are properly installed and maintained. In case of any damage or tear thereof, the Lessee shall be notified of such occurrence within 48-hours from receipt of notice.  The Lessor may at any time dismantle, roll or  pull-down the ad materials of the Lessee in case of an impending strong typhoon, strong wind,  bad weather, emergency, and other justifiable reasons, that may require the same. The Lessor shall re-install and pull-up the same, not later than 7 days after the weather is cleared, or after the reason for its dismantling and pull-down has ceased. Fees and expenses for such undertaking are for the account of the Lessor unless otherwise, agreed upon. In the event the advertising material is damaged by a typhoon due to Lessor's failure to dismantle, the cost of repair or replacement of the damaged material shall be for the sole account of the Lessor.  However, in any and all cases, the Lessor shall not be held liable for the repair or replacement of a damaged material supplied by the Lessee, if such damage is due to faulty fabrication or the fact that the material quality or grade is below the standard requirement (20oz.) set by the Lessor. In order to ensure the integrity of the Lessee's advertisement, it is recommended that the material be replaced every three (3) months. ",
        isBold: false,
        use: true,
    },
    {
        content: "Photographic materials on display should be replaced after six (6) months from the date of installation. If the materials remain unchanged by the eighth (8th) month, United Neon reserves the right to dismantle or remove them in accordance with safety standards and maintenance protocols. If United Neon decides to replace the material due to quality issues, it will not be liable for any non-exposure of advertisements. ",
        isBold: false,
        use: true,
    },
    {
        content: "This agreement may be renewed upon expiration, should the client be: (1) not in delay in the payment of monthly rentals; (2) not in default of any provisions on the formal contract; (3) able to submit a signed conforme to the Lessor at least 60 days prior to contract expiration.  Should there be no signed contract/conforme received on the given period, the site will be open for selling to other interested parties. Cancellation Penalty Fee for Renewed Contracts: Equivalent to One month rental amount.",
        isBold: false,
        use: true,
    },
    {
        label: "INTEREST AND PENALTY CHARGES",
        content: "An interest charge of 1% per month and a penalty charge of 1% per month shall be charged in addition to any rentals and amounts, reckoned from due date, in case of delay or default in the payments thereof.",
        isBold: false,
        use: true,
    }

]
