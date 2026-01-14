// import 'package:flutter/material.dart';
// import 'package:mobile_scanner/mobile_scanner.dart';

// void main() {
//   runApp(const MyApp());
// }

// class MyApp extends StatelessWidget {
//   const MyApp({super.key});
//   @override
//   Widget build(BuildContext context) {
//     return MaterialApp(
//       title: 'Barcode Scanner Demo',
//       theme: ThemeData(primarySwatch: Colors.blue),
//       home: const ScannerPage(),
//     );
//   }
// }

// class ScannerPage extends StatefulWidget {
//   const ScannerPage({super.key});
//   @override
//   State<ScannerPage> createState() => _ScannerPageState();
// }

// class _ScannerPageState extends State<ScannerPage> {
//   final MobileScannerController _controller = MobileScannerController();
//   String? _scanned;

//   bool _isPaused = false;

//   @override
//   void dispose() {
//     _controller.dispose();
//     super.dispose();
//   }

//   void _handleBarcode(BarcodeCapture capture) {
//     // capture.barcodes may contain multiple barcodes; we take the first here
//     final List<Barcode> barcodes = capture.barcodes;
//     if (barcodes.isEmpty) return;

//     final Barcode barcode = barcodes.first;
//     final String? raw = barcode.rawValue;

//     if (raw == null || raw.isEmpty) return;

//     // prevent multiple triggers: pause scanning and show result
//     if (!_isPaused) {
//       setState(() => _isPaused = true);
//       _controller.stop(); // pause camera scanning

//       setState(() => _scanned = raw);

//       // show a dialog (or you can Navigator.pop with the value to return it)
//       showDialog(
//         context: context,
//         builder: (_) => AlertDialog(
//           title: const Text('Scanned'),
//           content: Text(raw),
//           actions: [
//             TextButton(
//               onPressed: () {
//                 Navigator.of(context).pop();
//                 // resume scanning
//                 _controller.start();
//                 setState(() => _isPaused = false);
//               },
//               child: const Text('Scan again'),
//             ),
//             TextButton(
//               onPressed: () {
//                 Navigator.of(context).pop();
//                 // keep paused — if you want to return value to previous screen, use Navigator.pop(context, raw);
//               },
//               child: const Text('Done'),
//             ),
//           ],
//         ),
//       );
//     }
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(
//         title: const Text('Mobile Scanner Example'),
//         actions: [
//           IconButton(
//             icon: const Icon(Icons.cameraswitch),
//             tooltip: 'Switch camera',
//             onPressed: () => _controller.switchCamera(),
//           ),
//           IconButton(
//             icon: const Icon(Icons.flash_on),
//             tooltip: 'Toggle torch',
//             onPressed: () => _controller.toggleTorch(),
//           ),
//         ],
//       ),
//       body: Column(
//         children: [
//           // Scanner view
//           Expanded(
//             flex: 4,
//             child: MobileScanner(
//               controller: _controller,
//               // allowDuplicates: false,
//               // Called when a barcode is detected
//               onDetect: _handleBarcode,
//             ),
//           ),

//           // Info / controls
//           Expanded(
//             flex: 2,
//             child: Padding(
//               padding: const EdgeInsets.all(16),
//               child: Column(
//                 children: [
//                   if (_scanned != null) ...[
//                     const Text('Last scanned:', style: TextStyle(fontWeight: FontWeight.bold)),
//                     const SizedBox(height: 8),
//                     Text(_scanned!),
//                     const SizedBox(height: 16),
//                   ],
//                   Row(
//                     mainAxisAlignment: MainAxisAlignment.center,
//                     children: [
//                       ElevatedButton(
//                         onPressed: () {
//                           if (_isPaused) {
//                             _controller.start();
//                           } else {
//                             _controller.stop();
//                           }
//                           setState(() => _isPaused = !_isPaused);
//                         },
//                         child: Text(_isPaused ? 'Resume' : 'Pause'),
//                       ),
//                       const SizedBox(width: 12),
//                       ElevatedButton(
//                         onPressed: () async {
//                           // optional: capture a frame or do something else
//                           final bool isTorchOn = _controller.torchEnabled;
//                           ScaffoldMessenger.of(context).showSnackBar(
//                             SnackBar(content: Text('Torch is ${isTorchOn ? 'ON' : 'OFF'}')),
//                           );
//                         },
//                         child: const Text('Status'),
//                       ),
//                     ],
//                   ),
//                 ],
//               ),
//             ),
//           )
//         ],
//       ),
//     );
//   }
// }


import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Barcode Scanner',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: const ScannerPage(),
    );
  }
}

class ScannerPage extends StatefulWidget {
  const ScannerPage({super.key});

  @override
  State<ScannerPage> createState() => _ScannerPageState();
}

class _ScannerPageState extends State<ScannerPage> {
  final MobileScannerController _controller = MobileScannerController();
  final List<String> _scannedCodes = [];

  bool _isPaused = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _handleBarcode(BarcodeCapture capture) {
    if (_isPaused) return;

    final barcode = capture.barcodes.firstOrNull;
    final raw = barcode?.rawValue;

    if (raw == null || raw.isEmpty) return;
    if (_scannedCodes.contains(raw)) return;

    _controller.stop();
    _isPaused = true;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        title: const Text("Barcode Scanned"),
        content: Text(raw),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _controller.start();
              _isPaused = false;
            },
            child: const Text("Cancel"),
          ),
          ElevatedButton(
            onPressed: () {
              setState(() => _scannedCodes.add(raw));
              Navigator.pop(context);
              _controller.start();
              _isPaused = false;
            },
            child: const Text("Add"),
          ),
        ],
      ),
    );
  }

  void _openReviewPage() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => ReviewPage(
          codes: _scannedCodes,
          onUpdate: () => setState(() {}),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Scan Barcodes"),
        actions: [
          IconButton(
            icon: const Icon(Icons.list),
            tooltip: "Review scanned",
            onPressed: _openReviewPage,
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            flex: 4,
            child: MobileScanner(
              controller: _controller,
              onDetect: _handleBarcode,
            ),
          ),
          Expanded(
            flex: 2,
            child: Center(
              child: Text(
                "Scanned: ${_scannedCodes.length}",
                style: const TextStyle(fontSize: 18),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class ReviewPage extends StatefulWidget {
  final List<String> codes;
  final VoidCallback onUpdate;

  const ReviewPage({
    super.key,
    required this.codes,
    required this.onUpdate,
  });

  @override
  State<ReviewPage> createState() => _ReviewPageState();
}

class _ReviewPageState extends State<ReviewPage> {
  void _copyToClipboard() {
    final pythonList = "[${widget.codes.map((e) => '"$e"').join(", ")}]";
    Clipboard.setData(ClipboardData(text: pythonList));

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text("Copied to clipboard")),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Review Scanned Codes"),
        actions: [
          IconButton(
            icon: const Icon(Icons.copy),
            tooltip: "Copy as Python list",
            onPressed: widget.codes.isEmpty ? null : _copyToClipboard,
          ),
        ],
      ),
      body: widget.codes.isEmpty
          ? const Center(child: Text("No barcodes scanned"))
          : ListView.builder(
              itemCount: widget.codes.length,
              itemBuilder: (context, index) {
                return ListTile(
                  title: Text(widget.codes[index]),
                  trailing: IconButton(
                    icon: const Icon(Icons.delete, color: Colors.red),
                    onPressed: () {
                      setState(() => widget.codes.removeAt(index));
                      widget.onUpdate();
                    },
                  ),
                );
              },
            ),
    );
  }
}
