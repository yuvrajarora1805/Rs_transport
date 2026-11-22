import 'package:flutter/material.dart';
import '../../components/layout/erp_sidebar.dart';
import '../../core/sync/sync_service.dart';
import '../../core/theme/app_theme.dart';

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
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    syncService.addListener(_onUpdate);
    syncService.checkSyncStatus();
  }

  @override
  void dispose() {
    syncService.removeListener(_onUpdate);
    super.dispose();
  }

  void _onUpdate() {
    if (mounted) setState(() {});
  }

  int get _mobileNavIndex {
    if (widget.currentIndex == 0) return 0;
    if (widget.currentIndex == 1) return 1;
    if (widget.currentIndex == 2) return 2;
    if (widget.currentIndex == 3) return 3;
    return 4;
  }

  void _onMobileNavTap(int index) {
    if (index == 4) {
      _scaffoldKey.currentState?.openDrawer();
    } else {
      widget.onNavigate(index);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDesktop = MediaQuery.of(context).size.width >= 900;

    return Scaffold(
      key: _scaffoldKey,
      body: isDesktop
          ? Row(
              children: [
                ERPSidebar(
                  selectedIndex: widget.currentIndex,
                  onSelect: widget.onNavigate,
                ),
                Expanded(child: widget.child),
              ],
            )
          : widget.child,
      drawer: Drawer(
        child: ERPSidebar(
          selectedIndex: widget.currentIndex,
          onSelect: (i) {
            Navigator.pop(context);
            widget.onNavigate(i);
          },
        ),
      ),
      bottomNavigationBar: isDesktop
          ? null
          : NavigationBar(
              selectedIndex: _mobileNavIndex,
              onDestinationSelected: _onMobileNavTap,
              backgroundColor: Colors.white,
              elevation: 4,
              indicatorColor: AppColors.primary.withValues(alpha: 0.15),
              destinations: const [
                NavigationDestination(
                  icon: Icon(Icons.dashboard_outlined),
                  selectedIcon: Icon(Icons.dashboard, color: AppColors.primary),
                  label: 'Home',
                ),
                NavigationDestination(
                  icon: Icon(Icons.send_outlined),
                  selectedIcon: Icon(Icons.send, color: AppColors.primary),
                  label: 'Dispatch',
                ),
                NavigationDestination(
                  icon: Icon(Icons.navigation_outlined),
                  selectedIcon: Icon(Icons.navigation, color: AppColors.primary),
                  label: 'Trips',
                ),
                NavigationDestination(
                  icon: Icon(Icons.local_gas_station_outlined),
                  selectedIcon: Icon(Icons.local_gas_station, color: AppColors.primary),
                  label: 'Fuel',
                ),
                NavigationDestination(
                  icon: Icon(Icons.menu),
                  selectedIcon: Icon(Icons.menu_open, color: AppColors.primary),
                  label: 'Menu',
                ),
              ],
            ),
    );
  }
}
