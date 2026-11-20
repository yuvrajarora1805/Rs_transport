import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/sync/sync_service.dart';

class MainLayout extends StatefulWidget {
  final Widget child;
  final int currentIndex;
  final Function(int) onNavigate;

  const MainLayout({
    super.key,
    required this.child,
    required this.currentIndex,
    required this.onNavigate,
  });

  @override
  State<MainLayout> createState() => _MainLayoutState();
}

class _MainLayoutState extends State<MainLayout> {
  final syncService = SyncService();

  @override
  void initState() {
    super.initState();
    syncService.addListener(_onSyncUpdate);
    syncService.checkSyncStatus();
  }

  @override
  void dispose() {
    syncService.removeListener(_onSyncUpdate);
    super.dispose();
  }

  void _onSyncUpdate() {
    if (mounted) setState(() {});
  }

  final _navItems = const [
    NavigationDestination(icon: Icon(Icons.dashboard_outlined), selectedIcon: Icon(Icons.dashboard), label: 'Dashboard'),
    NavigationDestination(icon: Icon(Icons.local_shipping_outlined), selectedIcon: Icon(Icons.local_shipping), label: 'Dispatches'),
    NavigationDestination(icon: Icon(Icons.route_outlined), selectedIcon: Icon(Icons.route), label: 'Trips'),
    NavigationDestination(icon: Icon(Icons.local_gas_station_outlined), selectedIcon: Icon(Icons.local_gas_station), label: 'Fuel'),
    NavigationDestination(icon: Icon(Icons.receipt_long_outlined), selectedIcon: Icon(Icons.receipt_long), label: 'Settlements'),
    NavigationDestination(icon: Icon(Icons.directions_car_outlined), selectedIcon: Icon(Icons.directions_car), label: 'Trucks'),
  ];

  @override
  Widget build(BuildContext context) {
    final isDesktop = MediaQuery.of(context).size.width >= 800;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(6),
              ),
              child: const Text('RS', style: TextStyle(color: Colors.white, fontWeight: FontWeight.black, fontSize: 13)),
            ),
            const SizedBox(width: 8),
            const Text('RS Transport ERP', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
        actions: [
          // Offline / Online Cloud Sync Indicator Pill
          InkWell(
            onTap: () => syncService.triggerSyncNow(),
            borderRadius: BorderRadius.circular(20),
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: syncService.isOnline ? AppColors.success.withOpacity(0.12) : AppColors.warning.withOpacity(0.12),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: syncService.isOnline ? AppColors.success.withOpacity(0.3) : AppColors.warning.withOpacity(0.3),
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    syncService.isOnline ? Icons.cloud_done : Icons.cloud_off,
                    size: 14,
                    color: syncService.isOnline ? AppColors.success : AppColors.warning,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    syncService.pendingCount > 0 ? '${syncService.pendingCount} Pending' : (syncService.isOnline ? 'Online Synced' : 'Offline Mode'),
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: syncService.isOnline ? AppColors.success : AppColors.warning,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
      body: isDesktop
          ? Row(
              children: [
                NavigationRail(
                  selectedIndex: widget.currentIndex,
                  onDestinationSelected: widget.onNavigate,
                  labelType: NavigationRailLabelType.all,
                  destinations: _navItems
                      .map((d) => NavigationRailDestination(
                            icon: d.icon,
                            selectedIcon: d.selectedIcon,
                            label: Text(d.label),
                          ))
                      .toList(),
                ),
                const VerticalDivider(width: 1, thickness: 1, color: AppColors.border),
                Expanded(child: widget.child),
              ],
            )
          : widget.child,
      bottomNavigationBar: isDesktop
          ? null
          : NavigationBar(
              selectedIndex: widget.currentIndex,
              onDestinationSelected: widget.onNavigate,
              destinations: _navItems,
            ),
    );
  }
}
