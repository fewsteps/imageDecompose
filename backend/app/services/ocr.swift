import Foundation
import Vision
import AppKit

guard CommandLine.arguments.count > 1 else {
    print("Usage: ocr <image-path>")
    exit(1)
}

let imagePath = CommandLine.arguments[1]
let fileURL = URL(fileURLWithPath: imagePath)

guard let image = NSImage(contentsOf: fileURL),
      let tiffData = image.tiffRepresentation,
      let cgImageSource = CGImageSourceCreateWithData(tiffData as CFData, nil),
      let cgImage = CGImageSourceCreateImageAtIndex(cgImageSource, 0, nil) else {
    print("Error: Could not load image at path: \(imagePath)")
    exit(1)
}

let requestHandler = VNImageRequestHandler(cgImage: cgImage, options: [:])
let request = VNRecognizeTextRequest { request, error in
    if let error = error {
        print("Error in request: \(error.localizedDescription)")
        exit(1)
    }
    
    guard let observations = request.results as? [VNRecognizedTextObservation] else {
        print("[]")
        exit(0)
    }
    
    var results: [[String: Any]] = []
    let width = cgImage.width
    let height = cgImage.height
    
    for observation in observations {
        guard let candidate = observation.topCandidates(1).first else { continue }
        let text = candidate.string
        
        let boundingBox = observation.boundingBox
        let x = boundingBox.origin.x * Double(width)
        let y = (1.0 - boundingBox.origin.y - boundingBox.size.height) * Double(height)
        let w = boundingBox.size.width * Double(width)
        let h = boundingBox.size.height * Double(height)
        
        // Return 4 coordinates in clockwise order: top-left, top-right, bottom-right, bottom-left
        let points = [
            [x, y],
            [x + w, y],
            [x + w, y + h],
            [x, y + h]
        ]
        
        results.append([
            "text": text,
            "points": points
        ])
    }
    
    if let jsonData = try? JSONSerialization.data(withJSONObject: results, options: []),
       let jsonString = String(data: jsonData, encoding: .utf8) {
        print(jsonString)
    } else {
        print("[]")
    }
}

request.recognitionLevel = .accurate
do {
    try requestHandler.perform([request])
} catch {
    print("Error performing Vision OCR request: \(error.localizedDescription)")
    exit(1)
}
