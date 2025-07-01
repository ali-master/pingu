export const bashCompletion = `# Bash completion for pingu
_pingu() {
    local cur prev opts commands
    COMPREPLY=()
    cur="\${COMP_WORDS[COMP_CWORD]}"
    prev="\${COMP_WORDS[COMP_CWORD-1]}"
    
    commands="completion"
    opts="--count -c --chart -ch --display -d --interval -i --timeout -t --size -s --export -e --help -h --version -v"
    
    # Handle completion command
    if [[ \${COMP_WORDS[1]} == "completion" ]]; then
        if [[ \${COMP_CWORD} == 2 ]]; then
            COMPREPLY=( \$(compgen -W "bash zsh fish" -- \${cur}) )
            return 0
        fi
        return 0
    fi
    
    # Handle regular commands
    case "\${prev}" in
        --count|-c|--display|-d|--interval|-i|--timeout|-t|--size|-s)
            case "\${prev}" in
                --count|-c)
                    COMPREPLY=( \$(compgen -W "1 2 3 4 5 10 20 50 100" -- \${cur}) )
                    ;;
                --display|-d)
                    COMPREPLY=( \$(compgen -W "1 2 3 4 5 8 10 15 20" -- \${cur}) )
                    ;;
                --interval|-i)
                    COMPREPLY=( \$(compgen -W "0.2 0.5 1 2 5" -- \${cur}) )
                    ;;
                --timeout|-t)
                    COMPREPLY=( \$(compgen -W "1 2 5 10 30" -- \${cur}) )
                    ;;
                --size|-s)
                    COMPREPLY=( \$(compgen -W "32 56 64 128 256 512 1024" -- \${cur}) )
                    ;;
            esac
            return 0
            ;;
        *)
            ;;
    esac
    
    # Complete commands if first argument
    if [[ \${COMP_CWORD} == 1 ]]; then
        if [[ \${cur} == -* ]]; then
            COMPREPLY=( \$(compgen -W "\${opts}" -- \${cur}) )
        else
            local words="\${commands} google.com 8.8.8.8 1.1.1.1 cloudflare.com localhost 127.0.0.1"
            COMPREPLY=( \$(compgen -W "\${words}" -- \${cur}) )
        fi
        return 0
    fi
    
    # Complete options
    if [[ \${cur} == -* ]]; then
        COMPREPLY=( \$(compgen -W "\${opts}" -- \${cur}) )
        return 0
    fi
    
    # Complete hostnames/IPs for second+ arguments
    COMPREPLY=( \$(compgen -W "google.com 8.8.8.8 1.1.1.1 cloudflare.com localhost 127.0.0.1" -- \${cur}) )
}

complete -F _pingu pingu`;

export const zshCompletion = `#compdef pingu

_pingu() {
    local context state state_descr line
    typeset -A opt_args
    
    _arguments -C \\
        '1: :_pingu_commands' \\
        '*::arg:->args' \\
        '(-c --count)'{-c,--count}'[Number of ping packets to send]:count:(1 2 3 4 5 10 20 50 100)' \\
        '(-ch --chart)'{-ch,--chart}'[Display chart]' \\
        '(-d --display)'{-d,--display}'[Number of ping packets to display]:display:(1 2 3 4 5 8 10 15 20)' \\
        '(-i --interval)'{-i,--interval}'[Wait interval seconds between packets]:interval:(0.2 0.5 1 2 5)' \\
        '(-t --timeout)'{-t,--timeout}'[Timeout for response in seconds]:timeout:(1 2 5 10 30)' \\
        '(-s --size)'{-s,--size}'[Number of data bytes to send]:size:(32 56 64 128 256 512 1024)' \\
        '(-e --export)'{-e,--export}'[Export results to JSON file]' \\
        '(-h --help)'{-h,--help}'[Show help]' \\
        '(-v --version)'{-v,--version}'[Show version]'
        
    case $state in
        args)
            case $words[1] in
                completion)
                    _arguments ':shell:(bash zsh fish)'
                    ;;
                *)
                    _alternative \\
                        'hosts:host:(google.com 8.8.8.8 1.1.1.1 cloudflare.com localhost 127.0.0.1)' \\
                        'files:file:_files'
                    ;;
            esac
            ;;
    esac
}

_pingu_commands() {
    local commands=(
        'completion:Generate shell completion script'
        'google.com:Ping Google DNS'
        '8.8.8.8:Ping Google DNS'
        '1.1.1.1:Ping Cloudflare DNS'
        'cloudflare.com:Ping Cloudflare'
        'localhost:Ping localhost'
        '127.0.0.1:Ping localhost IP'
    )
    
    _describe 'commands' commands
}

_pingu "$@"`;

export const fishCompletion = `# Fish completion for pingu

# Main command completions
complete -c pingu -f -n '__fish_use_subcommand' -a 'completion' -d 'Generate shell completion script'

# Completion subcommand
complete -c pingu -f -n '__fish_seen_subcommand_from completion' -a 'bash zsh fish' -d 'Shell type'

# Option completions
complete -c pingu -s c -l count -d "Number of ping packets to send" -x -a "1 2 3 4 5 10 20 50 100"
complete -c pingu -l chart -d "Display chart"
complete -c pingu -s d -l display -d "Number of ping packets to display" -x -a "1 2 3 4 5 8 10 15 20"
complete -c pingu -s i -l interval -d "Wait interval seconds between packets" -x -a "0.2 0.5 1 2 5"
complete -c pingu -s t -l timeout -d "Timeout for response in seconds" -x -a "1 2 5 10 30"
complete -c pingu -s s -l size -d "Number of data bytes to send" -x -a "32 56 64 128 256 512 1024"
complete -c pingu -s e -l export -d "Export results to JSON file"
complete -c pingu -s h -l help -d "Show help"
complete -c pingu -s v -l version -d "Show version"

# Hostname/IP completions - only when not using completion subcommand
complete -c pingu -f -n 'not __fish_seen_subcommand_from completion' -a "google.com" -d "Google DNS"
complete -c pingu -f -n 'not __fish_seen_subcommand_from completion' -a "8.8.8.8" -d "Google DNS IP"
complete -c pingu -f -n 'not __fish_seen_subcommand_from completion' -a "1.1.1.1" -d "Cloudflare DNS"
complete -c pingu -f -n 'not __fish_seen_subcommand_from completion' -a "cloudflare.com" -d "Cloudflare"
complete -c pingu -f -n 'not __fish_seen_subcommand_from completion' -a "localhost" -d "Local host"
complete -c pingu -f -n 'not __fish_seen_subcommand_from completion' -a "127.0.0.1" -d "Localhost IP"`;

export function generateCompletion(shell: string): string {
  switch (shell.toLowerCase()) {
    case "bash":
      return bashCompletion;
    case "zsh":
      return zshCompletion;
    case "fish":
      return fishCompletion;
    default:
      throw new Error(`Unsupported shell: ${shell}. Supported shells: bash, zsh, fish`);
  }
}

export function printCompletionHelp(): void {
  console.log(`
🐚 Shell Completion Setup

Pingu supports tab completion for bash, zsh, and fish shells.

📋 Setup Instructions:

Bash:
  pingu completion bash > ~/.local/share/bash-completion/completions/pingu
  # Or system-wide:
  sudo pingu completion bash > /usr/local/etc/bash_completion.d/pingu
  
  Then add to ~/.bashrc:
  source ~/.local/share/bash-completion/completions/pingu

Zsh:
  pingu completion zsh > ~/.local/share/zsh/site-functions/_pingu
  
  Then add to ~/.zshrc:
  fpath=(~/.local/share/zsh/site-functions $fpath)
  autoload -U compinit && compinit

Fish:
  pingu completion fish > ~/.config/fish/completions/pingu.fish
  # Completions are automatically loaded

✨ Features:
  • Tab completion for all options (--count, --interval, etc.)
  • Smart value suggestions for numeric options
  • Common hostname/IP completions
  • Subcommand completion support

💡 Quick setup for current shell:
  eval "$(pingu completion bash)"  # For bash
  eval "$(pingu completion zsh)"   # For zsh
  pingu completion fish | source   # For fish
`);
}
