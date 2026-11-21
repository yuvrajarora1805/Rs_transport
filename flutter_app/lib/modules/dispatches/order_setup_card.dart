import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
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

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: const BorderSide(color: AppColors.border)),
      child: Padding(
        padding: const EdgeInsets.all(20),
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
                Expanded(
                  child: Column(
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
                      DropdownButtonFormField<String>(
                        value: selectedSourceId,
                        isExpanded: true,
                        decoration: const InputDecoration(hintText: '-- Choose Source --'),
                        items: sources.map((s) => DropdownMenuItem(value: s['id']?.toString(), child: Text(s['name'] ?? ''))).toList(),
                        onChanged: onSourceChanged,
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
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
                      DropdownButtonFormField<String>(
                        value: selectedDestId,
                        isExpanded: true,
                        decoration: const InputDecoration(hintText: '-- Choose Destination --'),
                        items: destinations.map((d) => DropdownMenuItem(value: d['id']?.toString(), child: Text(d['name'] ?? ''))).toList(),
                        onChanged: onDestChanged,
                      ),
                    ],
                  ),
                ),
              ],
            ),
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
