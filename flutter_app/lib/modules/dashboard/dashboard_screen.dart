import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class DashboardScreen extends StatelessWidget {
  final Function(int) onNavigate;

  const DashboardScreen({super.key, required this.onNavigate});

  Widget _buildStatCard(String title, String value, String subtitle, IconData icon, Color color) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textMuted)),
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(color: color.withOpacity(0.12), borderRadius: BorderRadius.circular(8)),
                  child: Icon(icon, color: color, size: 18),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.black, color: AppColors.textMain)),
            const SizedBox(height: 4),
            Text(subtitle, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text('Dashboard Overview', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.textMain)),
                  Text('Unified Fleet, Dispatch & Settlement Monitor', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
                ],
              ),
              ElevatedButton.icon(
                onPressed: () => onNavigate(1), // Go to dispatches
                icon: const Icon(Icons.add, size: 16),
                label: const Text('New Dispatch'),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Stat Grid
          LayoutBuilder(
            builder: (context, constraints) {
              final isWide = constraints.maxWidth > 700;
              return GridView.count(
                crossAxisCount: isWide ? 4 : 2,
                shrinkWrap: true,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: isWide ? 1.4 : 1.1,
                physics: const NeverScrollableScrollPhysics(),
                children: [
                  _buildStatCard('Fleet Trucks', '2,166', 'Active vehicles', Icons.directions_car, AppColors.primary),
                  _buildStatCard('Dispatches', '1,404', 'Total gate slips', Icons.local_shipping, AppColors.warning),
                  _buildStatCard('Weighbridge Trips', '695', 'Completed unloadings', Icons.route, AppColors.success),
                  _buildStatCard('Outstanding', '₹10.68 L', 'Pending driver pay', Icons.wallet, AppColors.danger),
                ],
              );
            },
          ),

          const SizedBox(height: 24),
          const Text('Quick Access Modules', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),

          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              ActionChip(
                avatar: const Icon(Icons.add_photo_alternate, size: 16, color: AppColors.primary),
                label: const Text('Capture Slip Photo'),
                onPressed: () => onNavigate(1),
              ),
              ActionChip(
                avatar: const Icon(Icons.local_gas_station, size: 16, color: AppColors.warning),
                label: const Text('Record Diesel Pump'),
                onPressed: () => onNavigate(3),
              ),
              ActionChip(
                avatar: const Icon(Icons.receipt, size: 16, color: AppColors.success),
                label: const Text('Driver Settlement'),
                onPressed: () => onNavigate(4),
              ),
              ActionChip(
                avatar: const Icon(Icons.table_chart, size: 16, color: AppColors.primaryDark),
                label: const Text('Plant Pass Reconcile'),
                onPressed: () => onNavigate(5),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
