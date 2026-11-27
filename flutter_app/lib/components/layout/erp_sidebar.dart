import 'package:flutter/material.dart';
import '../../context/company_context.dart';

class ERPSidebar extends StatelessWidget {
  final int selectedIndex;
  final Function(int) onSelect;

  const ERPSidebar({
    super.key,
    required this.selectedIndex,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    final company = CompanyState().activeCompany;
    final isRanbir = CompanyState().isRanbir;

    return Container(
      width: 260,
      color: const Color(0xFF1E293B), // slate-800
      child: Column(
        children: [
          // Header Logo & Firm
          Container(
            height: 70,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            color: const Color(0xFF0F172A), // slate-900
            child: Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: company.themeColor,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    company.initials,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w900,
                      fontSize: 14,
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        company.name,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        company.tagline,
                        style: TextStyle(
                          color: isRanbir
                              ? const Color(0xFF34D399)
                              : const Color(0xFF93C5FD),
                          fontSize: 8,
                          fontWeight: FontWeight.w600,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.swap_horiz, size: 16, color: Color(0xFF94A3B8)),
                  onPressed: () => CompanyState().toggleCompany(),
                  tooltip: 'Switch Firm',
                ),
              ],
            ),
          ),
          // Nav Items
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 12),
              children: [
                _sectionTitle('OPERATIONS', isRanbir),
                _navTile(0, 'Dashboard', Icons.dashboard_outlined, isRanbir),
                _navTile(1, 'Dispatches', Icons.send_outlined, isRanbir),
                _navTile(2, 'Trips & Freight', Icons.navigation_outlined, isRanbir),
                _navTile(3, 'Fuel & Diesel', Icons.local_gas_station_outlined, isRanbir),
                const SizedBox(height: 12),
                _sectionTitle('ACCOUNTS & SETTLEMENT', isRanbir),
                _navTile(4, 'Settlements', Icons.fact_check_outlined, isRanbir),
                _navTile(5, 'Payments', Icons.credit_card_outlined, isRanbir),
                _navTile(6, 'Outstanding', Icons.receipt_long_outlined, isRanbir),
                _navTile(7, 'Pump Accounts', Icons.local_gas_station, isRanbir),
                _navTile(8, 'Reports & Analytics', Icons.description_outlined, isRanbir),
                const SizedBox(height: 12),
                _sectionTitle('MASTERS', isRanbir),
                _navTile(9, 'Truck Master', Icons.local_shipping_outlined, isRanbir),
                _navTile(10, 'Transporters', Icons.airport_shuttle_outlined, isRanbir),
                _navTile(11, 'Sources Master', Icons.storefront_outlined, isRanbir),
                _navTile(12, 'Destinations', Icons.location_on_outlined, isRanbir),
                _navTile(13, 'Parties', Icons.business_outlined, isRanbir),
                _navTile(14, 'Reconcile Plant Pass', Icons.table_view_outlined, isRanbir),
                const SizedBox(height: 12),
                _sectionTitle('SYSTEM', isRanbir),
                _navTile(15, 'Excel Migration', Icons.cloud_upload_outlined, isRanbir),
              ],
            ),
          ),
          // Super Administrator User Card
          Container(
            padding: const EdgeInsets.all(12),
            color: const Color(0xFF0F172A),
            child: Row(
              children: [
                const CircleAvatar(
                  radius: 16,
                  backgroundColor: Color(0xFF2563EB),
                  child: Text('SA', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                ),
                const SizedBox(width: 10),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('Super Administrator', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                      Text('SUPER ADMIN', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 9)),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.logout, size: 16, color: Color(0xFF94A3B8)),
                  onPressed: () {},
                  tooltip: 'Logout',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _sectionTitle(String title, bool isRanbir) {
    return Padding(
      padding: const EdgeInsets.only(left: 16, right: 16, bottom: 6),
      child: Text(
        title,
        style: TextStyle(
          color: isRanbir ? const Color(0xFF34D399) : const Color(0xFF93C5FD),
          fontSize: 10,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.8,
        ),
      ),
    );
  }

  Widget _navTile(int index, String title, IconData icon, bool isRanbir) {
    final isSelected = selectedIndex == index;
    final activeColor = isRanbir ? const Color(0xFF059669) : const Color(0xFF2563EB);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
      decoration: BoxDecoration(
        color: isSelected ? activeColor : Colors.transparent,
        borderRadius: BorderRadius.circular(8),
      ),
      child: ListTile(
        dense: true,
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
        leading: Icon(
          icon,
          size: 18,
          color: isSelected ? Colors.white : const Color(0xFF94A3B8),
        ),
        title: Text(
          title,
          style: TextStyle(
            color: isSelected ? Colors.white : const Color(0xFFCBD5E1),
            fontSize: 13,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
          ),
        ),
        onTap: () => onSelect(index),
      ),
    );
  }
}

