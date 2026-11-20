import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'core/database/local_storage.dart';
import 'shared/layout/main_layout.dart';
import 'modules/dashboard/dashboard_screen.dart';
import 'modules/dispatches/dispatches_screen.dart';
import 'modules/trips/trips_screen.dart';
import 'modules/fuel/fuel_screen.dart';
import 'modules/settlements/settlements_screen.dart';
import 'modules/trucks/trucks_screen.dart';
import 'modules/reconcile/reconcile_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await LocalStorage().init();
  runApp(const RSTransportApp());
}

class RSTransportApp extends StatelessWidget {
  const RSTransportApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'RS Transport ERP',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const RootNavigationHost(),
    );
  }
}

class RootNavigationHost extends StatefulWidget {
  const RootNavigationHost({super.key});

  @override
  State<RootNavigationHost> createState() => _RootNavigationHostState();
}

class _RootNavigationHostState extends State<RootNavigationHost> {
  int _currentIndex = 0;

  void _onNavigate(int index) {
    setState(() => _currentIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    final screens = [
      DashboardScreen(onNavigate: _onNavigate),
      const DispatchesScreen(),
      const TripsScreen(),
      const FuelScreen(),
      const SettlementsScreen(),
      const TrucksScreen(),
      const ReconcileScreen(),
    ];

    return MainLayout(
      currentIndex: _currentIndex,
      onNavigate: _onNavigate,
      child: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
    );
  }
}

