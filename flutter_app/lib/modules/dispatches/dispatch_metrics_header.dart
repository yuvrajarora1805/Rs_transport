import 'package:flutter/material.dart';

class DispatchMetricsHeader extends StatelessWidget {
  final int totalOrders;
  final int totalBales;
  final int fleetActive;
  final int bookingSources;
  final VoidCallback onTrucksTap;
  final VoidCallback onSourcesTap;
  final VoidCallback onTripsTap;

  const DispatchMetricsHeader({
    super.key,
    required this.totalOrders,
    required this.totalBales,
    required this.fleetActive,
    required this.bookingSources,
    required this.onTrucksTap,
    required this.onSourcesTap,
    required this.onTripsTap,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isNarrow = constraints.maxWidth < 800;
        if (isNarrow) {
          return SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                _buildCard('TOTAL ORDERS', '$totalOrders', '$totalBales units', Icons.send, const Color(0xFF2563EB), null),
                const SizedBox(width: 12),
                _buildCard('FLEET ACTIVE', '$fleetActive', 'View Truck Master →', Icons.local_shipping, const Color(0xFF059669), onTrucksTap),
                const SizedBox(width: 12),
                _buildCard('BOOKING SOURCES', '$bookingSources', 'View Sources Master →', Icons.apartment, const Color(0xFF9333EA), onSourcesTap),
                const SizedBox(width: 12),
                _buildCard('TRIPS & FREIGHT', 'Weighbridge', 'Go to Trips Register →', Icons.explore, const Color(0xFFD97706), onTripsTap),
              ],
            ),
          );
        }

        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            children: [
              Expanded(child: _buildCard('TOTAL ORDERS', '$totalOrders', '$totalBales units', Icons.send, const Color(0xFF2563EB), null)),
              const SizedBox(width: 12),
              Expanded(child: _buildCard('FLEET ACTIVE', '$fleetActive', 'View Truck Master →', Icons.local_shipping, const Color(0xFF059669), onTrucksTap)),
              const SizedBox(width: 12),
              Expanded(child: _buildCard('BOOKING SOURCES', '$bookingSources', 'View Sources Master →', Icons.apartment, const Color(0xFF9333EA), onSourcesTap)),
              const SizedBox(width: 12),
              Expanded(child: _buildCard('TRIPS & FREIGHT', 'Weighbridge', 'Go to Trips Register →', Icons.explore, const Color(0xFFD97706), onTripsTap)),
            ],
          ),
        );
      },
    );
  }

  Widget _buildCard(String label, String val, String sub, IconData icon, Color iconColor, VoidCallback? onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        height: 84,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFE2E8F0)),
          boxShadow: const [BoxShadow(color: Color(0x04000000), blurRadius: 4, offset: Offset(0, 1))],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(label, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B), letterSpacing: 0.5)),
                const SizedBox(height: 2),
                Text(val, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: Color(0xFF0F172A))),
                Text(sub, style: TextStyle(fontSize: 10, color: onTap != null ? const Color(0xFF2563EB) : const Color(0xFF64748B), fontWeight: FontWeight.w600)),
              ],
            ),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(10), border: Border.all(color: const Color(0xFFE2E8F0))),
              child: Icon(icon, color: iconColor, size: 20),
            ),
          ],
        ),
      ),
    );
  }
}

