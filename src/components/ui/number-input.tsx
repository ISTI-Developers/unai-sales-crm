import React, { InputHTMLAttributes, useEffect, useState } from 'react'
import { Input } from './input'

const InputNumber = React.forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ value, onChange, ...props }, ref) => {
    const [display, setDisplay] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/,/g, "");
        if (!/^\d*\.?\d*$/.test(raw)) return; // only allow valid numbers

        // Format for display
        const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        setDisplay(formatted);

        // Notify parent (unformatted numeric string)
        if (onChange) {
            const syntheticEvent = {
                ...e,
                target: { ...e.target, value: raw },
            };
            onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
        }
    };

    useEffect(() => {
        if (value === undefined || value === null || value === "") {
            setDisplay("");
            return;
        }

        const num = Number(String(value).replace(/,/g, ""));
        if (!isNaN(num)) {
            const formatted = new Intl.NumberFormat("en-PH", {
                style: "decimal",
                maximumFractionDigits: 4,
            }).format(num);
            setDisplay(formatted);
        }
    }, [value]);

    return (
        <Input
            value={display}
            onChange={handleChange}
            inputMode="decimal"
            // placeholder=""
            ref={ref}
            {...props}
        />
    )
})

InputNumber.displayName = "InputNumber";

export default InputNumber