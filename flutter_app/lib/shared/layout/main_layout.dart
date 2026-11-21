import 'package:flutter/material.dart';
import '../../components/layout/erp_sidebar.dart';
import '../../context/company_context.dart';
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
  final companyState = CompanyState();

  @override
  void initState() {
    super.initState();
    syncService.addListener(_onUpdate);
    companyState.addListener(_onUpdate);
    syncService.checkSyncStatus();
  }

  @override
  void dispose() {
    syncService.removeListener(_onUpdate);
    companyState.removeListener(_onUpdate);
    super.dispose();
  }

  void _onUpdate() {
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final isDesktop = MediaQuery.of(context).size.width >= 900;

    return Scaffold(
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
      drawer: !isDesktop
          ? Drawer(
              child: ERPSidebar(
                selectedIndex: widget.currentIndex,
                onSelect: (i) {
                  Navigator.pop(context);
                  widget.onNavigate(i);
                },
              ),
            )
          : null,
    );
  }
}
