import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/components/slip_image_picker.dart';
import '../../shared/components/searchable_dropdown.dart';
import 'quick_dialogs.dart';

class VehicleAssignmentCard extends StatelessWidget {
  final bool isMultiMode;
  final String? selectedTruckId;
  final TextEditingController balesCtrl;
  final TextEditingController phoneCtrl;
  final List<Map<String, dynamic>> trucks;
  final List<Map<String, dynamic>> multiTruckRows;
  final ValueChanged<String?> onTruckChanged;
  final ValueChanged<Map<String, dynamic>> onTruckAdded;
  final ValueChanged<String?> onSlipSelected;
  final VoidCallback onAddMultiRow;
  final ValueChanged<int> onRemoveMultiRow;

  const VehicleAssignmentCard({
    super.key,
    required this.isMultiMode,
    required this.selectedTruckId,
    required this.balesCtrl,
    required this.phoneCtrl,
    required this.trucks,
    required this.multiTruckRows,
    required this.onTruckChanged,
    required this.onTruckAdded,
    required this.onSlipSelected,
    required this.onAddMultiRow,
    required this.onRemoveMultiRow,
  });

  Widget _buildTruckPicker(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Select Truck *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
            InkWell(
              onTap: () async {
                final res = await QuickAddDialogs.showAddTruck(context);
                if (res != null) onTruckAdded(res);
              },
              child: const Text('+ Add New Truck', style: TextStyle(fontSize: 11, color: AppColors.primary, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
        const SizedBox(height: 6),
        SearchableDropdown(
          value: selectedTruckId,
          label: 'Truck',
          hint: '-- Type truck plate or owner --',
          items: trucks.map((t) => DropdownSearchItem(
            id: t['id']?.toString() ?? '',
            label: '${t['truck_no'] ?? t['truckNo']}',
            subtitle: '${t['owner_name'] ?? t['ownerName'] ?? ''}',
          )).toList(),
          onChanged: onTruckChanged,
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
            Text(
              isMultiMode ? 'Assigned Fleet (${multiTruckRows.length} Trucks)' : 'Vehicle Assignment',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.textMain),
            ),
            const SizedBox(height: 4),
            const Text('Record truck registration, bales count & attach individual dispatch slip', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
            const Divider(height: 20),
            if (!isMultiMode) ...[
              if (isMobile) ...[
                _buildTruckPicker(context),
                const SizedBox(height: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Number of Bales', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 6),
                    TextField(controller: balesCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(hintText: 'e.g. 35')),
                  ],
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: phoneCtrl,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(labelText: 'Driver Contact Number (For this trip)', hintText: 'e.g. 9829012345'),
                ),
                const SizedBox(height: 12),
                SlipImagePicker(label: 'Attach Dispatch Slip', onImageSelected: onSlipSelected),
              ] else ...[
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(child: _buildTruckPicker(context)),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Number of Bales', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
                          TextField(controller: balesCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(hintText: 'e.g. 35')),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: TextField(
                        controller: phoneCtrl,
                        keyboardType: TextInputType.phone,
                        decoration: const InputDecoration(labelText: 'Driver Contact Number (For this trip)', hintText: 'e.g. 9829012345'),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: SlipImagePicker(label: 'Attach Dispatch Slip', onImageSelected: onSlipSelected),
                    ),
                  ],
                ),
              ],
            ] else ...[
              for (int i = 0; i < multiTruckRows.length; i++)
                Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppColors.border)),
                  child: Row(
                    children: [
                      Text('#${i + 1}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                      const SizedBox(width: 8),
                      Expanded(
                        flex: 2,
                        child: DropdownButtonFormField<String>(
                          value: multiTruckRows[i]['truckId'],
                          isExpanded: true,
                          decoration: const InputDecoration(hintText: 'Select Truck'),
                          items: trucks.map((t) => DropdownMenuItem(value: t['id']?.toString(), child: Text('${t['truck_no'] ?? t['truckNo']}'))).toList(),
                          onChanged: (v) => multiTruckRows[i]['truckId'] = v,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: TextField(
                          decoration: const InputDecoration(hintText: 'Bales'),
                          keyboardType: TextInputType.number,
                          onChanged: (v) => multiTruckRows[i]['bales'] = v,
                        ),
                      ),
                      const SizedBox(width: 4),
                      IconButton(
                        icon: const Icon(Icons.delete_outline, color: AppColors.danger, size: 20),
                        onPressed: multiTruckRows.length > 1 ? () => onRemoveMultiRow(i) : null,
                      ),
                    ],
                  ),
                ),
              ElevatedButton.icon(
                onPressed: onAddMultiRow,
                icon: const Icon(Icons.add, size: 16),
                label: const Text('Add Another Truck'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
