import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class DispatchOrderCard extends StatelessWidget {
  final Map<String, dynamic> dispatch;
  final VoidCallback onViewSlip;
  final VoidCallback onRecordLoading;
  final VoidCallback onDelete;

  const DispatchOrderCard({
    super.key,
    required this.dispatch,
    required this.onViewSlip,
    required this.onRecordLoading,
    required this.onDelete,
  });

  String _formatDate(dynamic d) {
    if (d == null) return '-';
    final s = d.toString();
    if (s.contains('T')) {
      final parts = s.split('T')[0].split('-');
      if (parts.length == 3) return '${parts[2]}/${parts[1]}/${parts[0]}';
    }
    return s.split(' ')[0];
  }

  @override
  Widget build(BuildContext context) {
    final d = dispatch;
    final date = _formatDate(d['date']);
    final srNo = d['sr_no'] ?? d['srNo'] ?? '-';
    final commodity = d['commodity'] ?? d['material'] ?? 'Cotton Bales';
    final source = d['source_name'] ?? d['sourceName'] ?? 'Standard Origin';
    final destination = d['destination'] ?? d['destination_name'] ?? 'Unassigned';
    final truckNo = d['truck_no'] ?? d['truckNo'] ?? 'UNASSIGNED';
    final bales = d['bales'] ?? 0;
    final phone = d['mobile_no'] ?? d['phone'] ?? '';
    final hasSlip = d['slip_image'] != null && d['slip_image'].toString().isNotEmpty;

    final tripId = d['trip_id'] ?? d['tripId'];
    final tripNo = d['trip_no'] ?? d['tripNo'];
    final isLoaded = tripId != null;

    final isDesktop = MediaQuery.of(context).size.width >= 1050;

    return Card(
      elevation: 0,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        child: isDesktop
            ? Row(
                children: [
                  SizedBox(
                    width: 86,
                    child: Text(date, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Color(0xFF64748B))),
                  ),
                  SizedBox(
                    width: 65,
                    child: Text(srNo.toString(), style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                  ),
                  SizedBox(
                    width: 95,
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(4)),
                        child: Text(commodity.toString(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: Color(0xFF475569))),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    flex: 2,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(source.toString(), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF0F172A)), overflow: TextOverflow.ellipsis),
                        Text('→ $destination', style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)), overflow: TextOverflow.ellipsis),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    flex: 4,
                    child: _buildFleetBlock(truckNo, bales, phone, hasSlip, isLoaded, tripNo),
                  ),
                  const SizedBox(width: 14),
                  SizedBox(
                    width: 75,
                    child: Text('$bales Bales', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF0F172A))),
                  ),
                  IconButton(
                    icon: const Icon(Icons.delete_outline, size: 18, color: Color(0xFFF43F5E)),
                    onPressed: onDelete,
                    tooltip: 'Delete Dispatch',
                  ),
                ],
              )
            : _buildMobileLayout(date, srNo.toString(), commodity.toString(), source.toString(), destination.toString(), truckNo.toString(), bales, phone, hasSlip, isLoaded, tripNo),
      ),
    );
  }

  Widget _buildFleetBlock(String truck, dynamic bales, dynamic phone, bool hasSlip, bool isLoaded, dynamic tripNo) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Wrap(
              crossAxisAlignment: WrapCrossAlignment.center,
              spacing: 6,
              runSpacing: 4,
              children: [
                Text(truck, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF2563EB), fontSize: 12)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                  decoration: BoxDecoration(color: Colors.white, border: Border.all(color: const Color(0xFFE2E8F0)), borderRadius: BorderRadius.circular(4)),
                  child: Text('$bales Bales', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600)),
                ),
                if (phone.toString().isNotEmpty)
                  Text(phone.toString(), style: const TextStyle(fontSize: 10, color: Color(0xFF64748B))),
                if (hasSlip)
                  InkWell(
                    onTap: onViewSlip,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                      decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(4), border: Border.all(color: const Color(0xFFBFDBFE))),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.image, size: 10, color: Color(0xFF2563EB)),
                          SizedBox(width: 2),
                          Text('Slip', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          if (isLoaded)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
              decoration: BoxDecoration(color: const Color(0xFFECFDF5), borderRadius: BorderRadius.circular(6), border: Border.all(color: const Color(0xFFA7F3D0))),
              child: Text(
                '✓ Loaded #$tripNo',
                style: const TextStyle(color: Color(0xFF047857), fontWeight: FontWeight.bold, fontSize: 10),
              ),
            )
          else
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2563EB),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                minimumSize: Size.zero,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                elevation: 0,
              ),
              onPressed: onRecordLoading,
              child: const Text('+ Record Loading', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
            ),
        ],
      ),
    );
  }

  Widget _buildMobileLayout(String date, String srNo, String commodity, String source, String destination, String truck, dynamic bales, dynamic phone, bool hasSlip, bool isLoaded, dynamic tripNo) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('SR #$srNo • $date', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF0F172A))),
            IconButton(icon: const Icon(Icons.delete_outline, size: 18, color: Color(0xFFF43F5E)), onPressed: onDelete, padding: EdgeInsets.zero, constraints: const BoxConstraints()),
          ],
        ),
        const SizedBox(height: 4),
        Text('$source → $destination', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))),
        const SizedBox(height: 6),
        _buildFleetBlock(truck, bales, phone, hasSlip, isLoaded, tripNo),
      ],
    );
  }
}
