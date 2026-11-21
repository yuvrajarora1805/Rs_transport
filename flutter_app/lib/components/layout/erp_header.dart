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
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
      ),
      child: Row(
        children: [
          if (onMenuPressed != null) ...[
            IconButton(
              icon: const Icon(Icons.menu, size: 20, color: Color(0xFF334155)),
              onPressed: onMenuPressed,
            ),
            const SizedBox(width: 4),
          ],
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF0F172A),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                if (subtitle != null)
                  Text(
                    subtitle!,
                    style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          // Sync Pill with Status Dot
          InkWell(
            onTap: () => sync.checkSyncStatus(),
            borderRadius: BorderRadius.circular(20),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
              decoration: BoxDecoration(
                color: sync.isOnline
                    ? const Color(0xFFECFDF5)
                    : const Color(0xFFFEF2F2),
                border: Border.all(
                  color: sync.isOnline
                      ? const Color(0xFFA7F3D0)
                      : const Color(0xFFFECACA),
                ),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 7,
                    height: 7,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: sync.isOnline
                          ? const Color(0xFF10B981)
                          : const Color(0xFFEF4444),
                    ),
                  ),
                  const SizedBox(width: 5),
                  Text(
                    sync.isOnline ? 'Connected' : 'Disconnected',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: sync.isOnline
                          ? const Color(0xFF059669)
                          : const Color(0xFFDC2626),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 8),
          // Firm Switcher Pill
          InkWell(
            onTap: () => CompanyState().toggleCompany(),
            borderRadius: BorderRadius.circular(8),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: isRanbir
                    ? const Color(0xFFECFDF5)
                    : const Color(0xFFEFF6FF),
                border: Border.all(
                  color: isRanbir
                      ? const Color(0xFFA7F3D0)
                      : const Color(0xFFBFDBFE),
                ),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                    decoration: BoxDecoration(
                      color: company.themeColor,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      company.initials,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    company.name,
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: isRanbir
                          ? const Color(0xFF047857)
                          : const Color(0xFF1D4ED8),
                    ),
                  ),
                  const SizedBox(width: 4),
                  Icon(
                    Icons.swap_horiz,
                    size: 13,
                    color: isRanbir
                        ? const Color(0xFF047857)
                        : const Color(0xFF1D4ED8),
                  ),
                ],
              ),
            ),
          ),
          if (actions != null) ...[
            const SizedBox(width: 8),
            actions!,
          ],
        ],
      ),
    );
  }
}
