import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import '../../core/theme/app_theme.dart';

class SlipImagePicker extends StatefulWidget {
  final String label;
  final String? initialBase64;
  final Function(String? base64Image) onImageSelected;

  const SlipImagePicker({
    super.key,
    this.label = 'Attach Scale / Receipt Slip Photo',
    this.initialBase64,
    required this.onImageSelected,
  });

  @override
  State<SlipImagePicker> createState() => _SlipImagePickerState();
}

class _SlipImagePickerState extends State<SlipImagePicker> {
  String? _base64Image;

  @override
  void initState() {
    super.initState();
    _base64Image = widget.initialBase64;
  }

  Future<void> _pickImage() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
        withData: true,
      );

      if (result != null && result.files.isNotEmpty) {
        final bytes = result.files.first.bytes;
        if (bytes != null) {
          final ext = result.files.first.extension ?? 'jpeg';
          final b64 = 'data:image/$ext;base64,${base64Encode(bytes)}';
          setState(() => _base64Image = b64);
          widget.onImageSelected(b64);
        }
      }
    } catch (e) {
      debugPrint('Error picking file: $e');
    }
  }

  void _removeImage() {
    setState(() => _base64Image = null);
    widget.onImageSelected(null);
  }

  void _viewFullScreen() {
    if (_base64Image == null) return;
    final cleanB64 = _base64Image!.contains(',') ? _base64Image!.split(',')[1] : _base64Image!;
    final imageBytes = base64Decode(cleanB64);

    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        backgroundColor: Colors.transparent,
        child: Stack(
          alignment: Alignment.topRight,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.memory(imageBytes, fit: BoxFit.contain),
            ),
            IconButton(
              icon: const CircleAvatar(backgroundColor: Colors.black54, child: Icon(Icons.close, color: Colors.white, size: 18)),
              onPressed: () => Navigator.pop(ctx),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_base64Image != null) {
      final cleanB64 = _base64Image!.contains(',') ? _base64Image!.split(',')[1] : _base64Image!;
      ImageProvider? imgProvider;
      try {
        imgProvider = MemoryImage(base64Decode(cleanB64));
      } catch (_) {}

      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          children: [
            if (imgProvider != null)
              GestureDetector(
                onTap: _viewFullScreen,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image(image: imgProvider, width: 56, height: 56, fit: BoxFit.cover),
                ),
              ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(widget.label, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const Text('Slip photo attached successfully', style: TextStyle(color: AppColors.success, fontSize: 11)),
                ],
              ),
            ),
            IconButton(
              onPressed: _viewFullScreen,
              icon: const Icon(Icons.fullscreen, color: AppColors.primary, size: 20),
              tooltip: 'Inspect Photo',
            ),
            IconButton(
              onPressed: _removeImage,
              icon: const Icon(Icons.delete_outline, color: AppColors.danger, size: 20),
              tooltip: 'Remove',
            ),
          ],
        ),
      );
    }

    return InkWell(
      onTap: _pickImage,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: AppColors.background,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.border, style: BorderStyle.solid),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.camera_alt_outlined, color: AppColors.primary, size: 20),
            const SizedBox(width: 8),
            Text(widget.label, style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 13)),
          ],
        ),
      ),
    );
  }
}
