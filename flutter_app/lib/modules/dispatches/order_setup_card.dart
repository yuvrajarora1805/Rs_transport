import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/components/searchable_dropdown.dart';
import 'quick_dialogs.dart';

class OrderSetupCard extends StatelessWidget {
  final bool isMultiMode;
  final TextEditingController dateCtrl;
  final TextEditingController srNoCtrl;
  final String? selectedSourceId;
  final String? selectedDestId;
  final String commodity;
  final List<Map<String, dynamic>> sources;
  final List<Map<String, dynamic>> destinations;
  final ValueChanged<bool> onModeChanged;
  final ValueChanged<String?> onSourceChanged;
  final ValueChanged<String?> onDestChanged;
  final ValueChanged<String> onCommodityChanged;
  final ValueChanged<Map<String, dynamic>> onSourceAdded;
  final ValueChanged<Map<String, dynamic>> onDestAdded;

  const OrderSetupCard({
    super.key,
    required this.isMultiMode,
    required this.dateCtrl,
    required this.srNoCtrl,
    required this.selectedSourceId,
    required this.selectedDestId,
    required this.commodity,
    required this.sources,
    required this.destinations,
    required this.onModeChanged,
    required this.onSourceChanged,
    required this.onDestChanged,
    required this.onCommodityChanged,
    required this.onSourceAdded,
    required this.onDestAdded,
  });

  Widget _togglePill(String text, bool active, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: active ? AppColors.primary : AppColors.background,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: active ? AppColors.primary : AppColors.border),
        ),
        child: Text(text, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: active ? Colors.white : AppColors.textMain)),
      ),
    );
  }

  Widget _buildSourceField(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Booking Source *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
            InkWell(
              onTap: () async {
                final res = await QuickAddDialogs.showAddSource(context);
                if (res != null) onSourceAdded(res);
              },
              child: const Text('+ Add Source', style: TextStyle(fontSize: 11, color: AppColors.primary, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
        const SizedBox(height: 6),
        SearchableDropdown(
          value: selectedSourceId,
          label: 'Source',
          hint: '-- Type to search source --',
          items: sources.map((s) => DropdownSearchItem(id: s['id']?.toString() ?? '', label: s['name'] ?? '', subtitle: s['city'])).toList(),
          onChanged: onSourceChanged,
        ),
      ],
    );
  }

  Widget _buildDestField(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Destination Place', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
            InkWell(
              onTap: () async {
                final res = await QuickAddDialogs.showAddDestination(context);
                if (res != null) onDestAdded(res);
              },
              child: const Text('+ Add Destination', style: TextStyle(fontSize: 11, color: AppColors.primary, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
        const SizedBox(height: 6),
        SearchableDropdown(
          value: selectedDestId,
          label: 'Destination',
          hint: '-- Type to search destination --',
          items: destinations.map((d) => DropdownSearchItem(id: d['id']?.toString() ?? '', label: d['name'] ?? '', subtitle: d['state'])).toList(),
          onChanged: onDestChanged,
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final isMobile = MediaQuery.of(context).size.width < 600;

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: const BorderSide(color: AppColors.border)),
      child: Padding(
        padding: EdgeInsets.all(isMobile ? 14 : 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Dispatch Order Setup', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.textMain)),
                Row(
                  children: [
                    _togglePill('Single Truck', !isMultiMode, () => onModeChanged(false)),
                    const SizedBox(width: 6),
                    _togglePill('Multiple Trucks', isMultiMode, () => onModeChanged(true)),
                  ],
                ),
              ],
            ),
            const Divider(height: 24),
            if (isMobile) ...[
              TextField(
                controller: dateCtrl,
                decoration: const InputDecoration(labelText: 'Dispatch Date *', suffixIcon: Icon(Icons.calendar_today, size: 16)),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: srNoCtrl,
                decoration: const InputDecoration(labelText: 'SR / Reference Number', hintText: 'e.g. 1001'),
              ),
              const SizedBox(height: 12),
              _buildSourceField(context),
              const SizedBox(height: 12),
              _buildDestField(context),
            ] else ...[
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: dateCtrl,
                      decoration: const InputDecoration(labelText: 'Dispatch Date *', suffixIcon: Icon(Icons.calendar_today, size: 16)),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: TextField(
                      controller: srNoCtrl,
                      decoration: const InputDecoration(labelText: 'SR / Reference Number', hintText: 'e.g. 1001'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(child: _buildSourceField(context)),
                  const SizedBox(width: 16),
                  Expanded(child: _buildDestField(context)),
                ],
              ),
            ],
            const SizedBox(height: 16),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Commodity / Product *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                DropdownButtonFormField<String>(
                  value: commodity,
                  isExpanded: true,
                  items: ['Cotton Bales', 'Paddy Seeds', 'Wheat', 'Mustard', 'Corn'].map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                  onChanged: (v) => onCommodityChanged(v ?? 'Cotton Bales'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
