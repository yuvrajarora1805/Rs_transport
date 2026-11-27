import 'dart:convert';
import 'package:flutter/material.dart';

class TripCardItem extends StatelessWidget {
  final Map<String, dynamic> trip;
  final VoidCallback onViewSlip;
  final VoidCallback onSettle;
  final VoidCallback onDelete;

  const TripCardItem({
    super.key,
    required this.trip,
    required this.onViewSlip,
    required this.onSettle,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final t = trip;
    final tripNo = t['trip_no'] ?? t['tripNo'] ?? '-';
    final truck = t['truck_no'] ?? t['truckNo'] ?? 'TRUCK';
    final dest = t['destination_name'] ?? t['destination'] ?? '-';
    final party = t['party_name'] ?? t['party'] ?? '-';
    final gross = t['gross_freight'] ?? t['grossFreight'] ?? 0;
    final diesel = t['total_diesel'] ?? 0;
    final hasSettlement = t['settlement_id'] != null;
    final hasSlip = t['slip_image'] != null && t['slip_image'].toString().isNotEmpty;

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: Color(0xFFE2E8F0))),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundColor: const Color(0xFFEFF6FF),
              child: Text('#$tripNo', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(truck, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A))),
                      const SizedBox(width: 8),
                      Text('→ $dest', style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                      if (hasSlip) ...[
                        const SizedBox(width: 6),
                        InkWell(
                          onTap: onViewSlip,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                            decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(4), border: Border.all(color: const Color(0xFFBFDBFE))),
                            child: const Text('Slip', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))),
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text('Party: $party • Diesel Deducted: ₹$diesel', style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text('₹$gross', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A))),
                const SizedBox(height: 4),
                if (hasSettlement)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(color: const Color(0xFFECFDF5), borderRadius: BorderRadius.circular(4)),
                    child: const Text('SETTLED', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF059669))),
                  )
                else
                  InkWell(
                    onTap: onSettle,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(color: const Color(0xFFFEF3C7), borderRadius: BorderRadius.circular(4)),
                      child: const Text('+ Settle →', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFFD97706))),
                    ),
                  ),
              ],
            ),
            IconButton(
              icon: const Icon(Icons.delete_outline, size: 18, color: Color(0xFFF43F5E)),
              onPressed: onDelete,
            ),
          ],
        ),
      ),
    );
  }
}

