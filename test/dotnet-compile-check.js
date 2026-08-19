#!/usr/bin/env node
/**
 * Compile-check the an5example generated .NET client + the standalone .NET
 * adapter. Copies the generated sources and the shipped adapter C# into a
 * temporary SDK-style project and runs `dotnet build`.
 *
 * Run: node test/dotnet-compile-check.js
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const exampleRoot = path.join(__dirname, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'an5-dotnet-check-'));

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(path.join(tmp, dest)), { recursive: true });
  fs.copyFileSync(src, path.join(tmp, dest));
}

try {
  // Generated client only. (The runtime adapter is a separate, alternative
  // stack and is compile-checked in the an5Adapters repo.)
  for (const f of ['An5Config.cs', 'An5DbContext.cs', 'An5OrmTypes.cs', 'User.cs', 'Order.cs']) {
    copyFile(path.join(exampleRoot, 'generated', 'dotnet', f), f);
  }

  fs.writeFileSync(
    path.join(tmp, 'An5DotnetCheck.csproj'),
    [
      '<Project Sdk="Microsoft.NET.Sdk">',
      '  <PropertyGroup>',
      '    <TargetFramework>net8.0</TargetFramework>',
      '    <Nullable>disable</Nullable>',
      '    <ImplicitUsings>enable</ImplicitUsings>',
      '    <GenerateAssemblyInfo>false</GenerateAssemblyInfo>',
      '  </PropertyGroup>',
      '  <ItemGroup>',
      '    <PackageReference Include="Npgsql" Version="8.0.6" />',
      '    <PackageReference Include="Microsoft.Data.SqlClient" Version="5.2.2" />',
      '  </ItemGroup>',
      '</Project>',
      '',
    ].join('\n'),
    'utf8',
  );

  execFileSync('dotnet', ['build', tmp, '--nologo'], { stdio: 'inherit' });
  console.log('an5example .NET compile check passed');
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}