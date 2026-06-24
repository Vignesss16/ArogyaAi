export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Pharmacist } from "@/models/index";

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { phone, action, medicine } = body;

    console.log("Stock PATCH called:", { phone, action, medicine });

    if (!phone || !action || !medicine) {
      return NextResponse.json(
        { error: "phone, action and medicine are required" },
        { status: 400 }
      );
    }

    const pharmacist = await Pharmacist.findOne({ phone });
    if (!pharmacist) {
      return NextResponse.json(
        { error: "Pharmacist not found. Please login again." },
        { status: 404 }
      );
    }

    if (action === "add") {
      const exists = pharmacist.stock.find(
        (s: any) => s.medicineName.toLowerCase() === medicine.medicineName.toLowerCase()
      );
      if (exists) {
        return NextResponse.json(
          { error: `${medicine.medicineName} already exists in your stock` },
          { status: 400 }
        );
      }
      pharmacist.stock.push({
        medicineName: medicine.medicineName,
        qty:          Number(medicine.qty) || 0,
        minRequired:  Number(medicine.minRequired) || 30,
        price:        medicine.price || "Ask at counter",
        inStock:      Number(medicine.qty) > 0,
      });
    }

    if (action === "update") {
      const idx = pharmacist.stock.findIndex(
        (s: any) => s.medicineName.toLowerCase() === medicine.medicineName.toLowerCase()
      );
      if (idx === -1) {
        return NextResponse.json({ error: "Medicine not found in stock" }, { status: 404 });
      }
      pharmacist.stock[idx].qty         = Number(medicine.qty) ?? pharmacist.stock[idx].qty;
      pharmacist.stock[idx].minRequired = Number(medicine.minRequired) ?? pharmacist.stock[idx].minRequired;
      pharmacist.stock[idx].price       = medicine.price ?? pharmacist.stock[idx].price;
      pharmacist.stock[idx].inStock     = Number(medicine.qty) > 0;
    }

    if (action === "remove") {
      pharmacist.stock = pharmacist.stock.filter(
        (s: any) => s.medicineName.toLowerCase() !== medicine.medicineName.toLowerCase()
      );
    }

    pharmacist.markModified("stock");
    await pharmacist.save();

    console.log("Stock saved successfully for:", phone);
    return NextResponse.json({ pharmacist });

  } catch (err: any) {
    console.error("Stock PATCH error:", err.message);
    return NextResponse.json({ error: "DB error: " + err.message }, { status: 500 });
  }
}