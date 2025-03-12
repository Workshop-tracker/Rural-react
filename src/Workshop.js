import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectItem } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const data = [
    { offer: "Demand Gen- Digital", workshop: "Fidato Car Services", status: "Yes", date: "2025-04-01" },
    { offer: "Partnerships: Uber", workshop: "SNA Automobile", status: "Yes", date: "2025-04-02" },
    { offer: "Hyperlocal Activations", workshop: "Marvel Automobiles", status: "Yes", date: "2025-04-03" },
];

export default function Dashboard() {
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedWorkshop, setSelectedWorkshop] = useState("");

    const filteredData = data.filter(item => 
        (selectedDate ? item.date === selectedDate : true) &&
        (selectedWorkshop ? item.workshop === selectedWorkshop : true)
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex gap-4">
                <Select onValueChange={setSelectedDate}>
                    <SelectItem value="">All Dates</SelectItem>
                    <SelectItem value="2025-04-01">2025-04-01</SelectItem>
                    <SelectItem value="2025-04-02">2025-04-02</SelectItem>
                    <SelectItem value="2025-04-03">2025-04-03</SelectItem>
                </Select>
                
                <Select onValueChange={setSelectedWorkshop}>
                    <SelectItem value="">All Workshops</SelectItem>
                    <SelectItem value="Fidato Car Services">Fidato Car Services</SelectItem>
                    <SelectItem value="SNA Automobile">SNA Automobile</SelectItem>
                    <SelectItem value="Marvel Automobiles">Marvel Automobiles</SelectItem>
                </Select>
            </div>

            <Card>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Offer Element</TableHead>
                                <TableHead>Workshop</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.offer}</TableCell>
                                    <TableCell>{item.workshop}</TableCell>
                                    <TableCell>{item.status}</TableCell>
                                    <TableCell>{item.date}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
