import 'package:flutter/material.dart';
import '../../core/sync/sync_service.dart';
import '../../context/company_context.dart';

class ERPHeader extends StatelessWidget {
  final String title;
  final String? subtitle;
  final Widget? actions;
  final VoidCallback? onMenuPressed;

  const ERPHeader({
    super.key,
    required this.title,
    this.subtitle,
    this.actions,
    this.onMenuPressed,
  });

  @override
  Widget build(BuildContext context) {
    final company = CompanyState().activeCompany;
    final isRanbir = CompanyState().isRanbir;
    final sync = SyncService();

    return Container(
      height: 70,
      padding: const EdgeInsets.symmetric(horizontal: 20),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              if (onMenuPressed != null) ...[
                IconButton(
                  icon: const Icon(Icons.menu, size: 22, color: Color(0xFF334155)),
                  onPressed: onMenuPressed,
                ),
                const SizedBox(width: 8),
              ],
              Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF0F172A),
                    ),
                  ),
                  if (subtitle != null)
                    Text(
                      subtitle!,
                      style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                    ),
                ],
              ),
            ],
          ),
          Row(
            children: [
              // Sync Pill
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: sync.isOnline
                      ? const Color(0xFFECFDF5)
                      : const Color(0xFFFFFBEB),
                  border: Border.all(
                    color: sync.isOnline
                        ? const Color(0xFFA7F3D0)
                        : const Color(0xFFFDE68A),
                  ),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  children: [
                    Icon(
                      sync.isOnline ? Icons.cloud_done : Icons.cloud_off,
                      size: 13,
                      color: sync.isOnline
                          ? const Color(0xFF059669)
                          : const Color(0xFFD97706),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      sync.isOnline ? 'Online Synced' : 'Offline Mode',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: sync.isOnline
                            ? const Color(0xFF059669)
                            : const Color(0xFFD97706),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 10),
              // Firm Switcher Pill
              InkWell(
                onTap: () => CompanyState().toggleCompany(),
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: isRanbir
                        ? const Color(0xFFECFDF5)
                        : const Color(0xFFEFF6FF),
                    border: Border.all(
                      color: isRanbir
                          ? const Color(0xFFA7F3D0)
                          : const Color(0xFFBFDBFE),
                    ),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: company.themeColor,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          company.initials,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            company.name,
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: isRanbir
                                  ? const Color(0xFF047857)
                                  : const Color(0xFF1D4ED8),
                            ),
                          ),
                          const Text(
                            'Switch Firm',
                            style: TextStyle(
                              fontSize: 9,
                              color: Color(0xFF64748B),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(width: 6),
                      Icon(
                        Icons.swap_horiz,
                        size: 14,
                        color: isRanbir
                            ? const Color(0xFF047857)
                            : const Color(0xFF1D4ED8),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),
              // Search Input
              Container(
                width: 220,
                height: 36,
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const TextField(
                  decoration: InputDecoration(
                    hintText: 'Search trucks, trips...',
                    hintStyle: TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                    prefixIcon: Icon(Icons.search, size: 16, color: Color(0xFF94A3B8)),
                    border: InputBorder.none,
                    isDense: true,
                    contentPadding: EdgeInsets.symmetric(vertical: 8),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              if (actions != null) actions!,
            ],
          ),
        ],
      ),
    );
  }
}

