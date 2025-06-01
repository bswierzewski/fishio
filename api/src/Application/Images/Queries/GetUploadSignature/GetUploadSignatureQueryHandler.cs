using Application.Common.Options;
using Microsoft.Extensions.Options;
using System.Security.Cryptography;
using System.Text;

namespace Fishio.Application.Images.Queries.GetUploadSignature;

public class GetUploadSignatureQueryHandler : IRequestHandler<GetUploadSignatureQuery, UploadSignatureResult>
{
    private readonly CloudinaryOptions _cloudinaryOptions;
    private readonly ICurrentUserService _currentUserService;

    public GetUploadSignatureQueryHandler(
        IOptions<CloudinaryOptions> cloudinaryOptions,
        ICurrentUserService currentUserService)
    {
        _cloudinaryOptions = cloudinaryOptions.Value;
        _currentUserService = currentUserService;
    }

    public async Task<UploadSignatureResult> Handle(GetUploadSignatureQuery request, CancellationToken cancellationToken)
    {
        var currentUser = await _currentUserService.GetOrProvisionDomainUserAsync(cancellationToken);
        if (currentUser == null || currentUser.Id == 0)
        {
            throw new UnauthorizedAccessException("Użytkownik musi być zalogowany, aby uzyskać podpis do przesyłania.");
        }

        // Generate timestamp
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

        // Determine folder structure
        var folderName = !string.IsNullOrEmpty(request.FolderName)
            ? $"{request.FolderName}/{currentUser.Id}"
            : $"uploads/{currentUser.Id}";

        // Build parameters for signature
        var parameters = new SortedDictionary<string, object>
        {
            { "timestamp", timestamp },
            { "folder", folderName }
        };

        // Add public_id if provided
        if (!string.IsNullOrEmpty(request.PublicId))
        {
            parameters["public_id"] = request.PublicId;
        }

        // Generate signature
        var signature = GenerateSignature(parameters, _cloudinaryOptions.ApiSecret!);

        return new UploadSignatureResult
        {
            Signature = signature,
            ApiKey = _cloudinaryOptions.ApiKey!,
            CloudName = _cloudinaryOptions.CloudName!,
            Timestamp = timestamp,
            FolderName = folderName,
            PublicId = request.PublicId,
            UploadUrl = $"https://api.cloudinary.com/v1_1/{_cloudinaryOptions.CloudName}/image/upload"
        };
    }

    private static string GenerateSignature(SortedDictionary<string, object> parameters, string apiSecret)
    {
        // Build the string to sign
        var stringToSign = string.Join("&", parameters.Select(p => $"{p.Key}={p.Value}"));
        stringToSign += apiSecret;

        // Generate SHA1 hash
        using var sha1 = SHA1.Create();
        var hash = sha1.ComputeHash(Encoding.UTF8.GetBytes(stringToSign));
        return Convert.ToHexString(hash).ToLower();
    }
}